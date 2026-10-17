# One-time Firefox administrator defaults

This fork reads an optional `initialSettings` object from Firefox's
`storage.managed` API. It copies validated preferences into an **empty extension
local store once**. This is an initial-preferences interface, not a locked-policy
layer, a storage backup importer, or Firefox Sync support.

## Contract

- Initialization runs in the background context. Options, the toolbar popup,
  YouTube pages and embedded players wait for it before reading their initial
  configuration; normal settings writers are not attached until that read finishes.
- **Any existing local key makes a profile ineligible**, including an explicit
  `false`, runtime/UI state, an empty saved list, or settings from an older version.
  Existing profiles are not partially filled with new defaults.
- On an eligible profile, supplied preferences and the internal
  `__cpfyInitialSettingsApplied` marker are submitted in the same
  `storage.local.set()` call. Concurrent initial requests share one initializer,
  and local storage is checked again after reading the policy.
- Later settings changes belong to the user. Restarting Firefox, updating the
  extension, changing or removing the policy, and deleting an individual preference
  do not reapply the seed. Unspecified preferences continue to use the extension's
  built-in defaults; those defaults are not copied or frozen by this interface.
- Missing managed storage or a missing `initialSettings` property causes no write.
  An explicit `initialSettings: {}` records completion without setting preferences.
- Invalid keys or values reject the **whole** seed with a console warning. No
  partial import or completion marker is written. Correct the policy and restart
  Firefox while the extension store is still empty to retry. Local read failures
  are never treated as empty storage; a failed write can be retried.
- The boundary is the extension's local store **in each Firefox profile**, not a
  Linux account. A new profile, or explicitly clearing all extension storage
  including the marker, permits initialization again. Uninstall/reinstall may also
  clear that store. This is deliberately not tamper protection.

No Firefox profile files, generated extension-origin UUIDs, IndexedDB databases,
accounts, cookies, history, or another user's extension state are read or copied by
this feature. Firefox itself performs the local-storage write through its API.
There is no additional network request or user account requirement for seeding.

## Firefox enterprise policy

Use a build containing this change. **The unchanged upstream/AMO extension does
not gain this interface just because these policy keys are present.**

The source currently declares `control-panel-for-youtube@jbscript.dev` in
`manifest.mv2.json`. That is the upstream ID, retained here to keep the feature
patch separable from packaging. For an independently signed fork, choose your own
stable add-on ID in that manifest and replace the ID everywhere below. Do not
submit a new independently owned add-on under the upstream author's ID.

Example `policies.json`:

```json
{
  "policies": {
    "ExtensionSettings": {
      "control-panel-for-youtube@jbscript.dev": {
        "installation_mode": "normal_installed",
        "install_url": "https://example.invalid/control-panel-for-youtube-signed.xpi"
      }
    },
    "3rdparty": {
      "Extensions": {
        "control-panel-for-youtube@jbscript.dev": {
          "initialSettings": {
            "enabled": true,
            "hideShorts": true,
            "redirectShorts": true,
            "disableAutoplay": true
          }
        }
      }
    }
  }
}
```

Replace the deliberately nonfunctional example URL with your signed build's real
HTTPS or `file:///` install URL. Merge this into your existing policy document;
do not discard other policies. Restart Firefox after deploying managed data.
Check enterprise-policy recognition and errors in `about:policies`.

`normal_installed` allows the user to disable the extension. The feature also
intentionally leaves its preferences editable. Hiding Shorts and changing their
viewer behavior must not be mistaken for an access-control boundary or guaranteed
blocking of the underlying videos.

## Home Manager

### Firefox managed by Home Manager

For a Firefox package/wrapper that supports Home Manager's `policies` option:

```nix
{ ... }:
let
  # Replace with your independently signed fork's actual manifest ID.
  extensionId = "control-panel-for-youtube@jbscript.dev";
in {
  programs.firefox = {
    enable = true;
    policies = {
      ExtensionSettings.${extensionId} = {
        installation_mode = "normal_installed";
        # Replace this placeholder with the actual signed fork, not upstream AMO.
        install_url = "https://example.invalid/control-panel-for-youtube-signed.xpi";
      };
      "3rdparty".Extensions.${extensionId}.initialSettings = {
        enabled = true;
        hideShorts = true;
        redirectShorts = true;
        disableAutoplay = true;
      };
    };
  };
}
```

Those policy attributes have no outer `policies` wrapper: Home Manager supplies
that when creating Firefox's policy document. Do not assume this module can
configure a separately installed system Firefox when `package = null` or when
the selected package cannot be reconfigured. Keep installation management in your
existing Firefox policy deployment in that case.

### Per-Linux-user defaults, including system Firefox

Firefox also exposes native managed-storage manifests through the same API.
For different initial choices per Linux account, Home Manager can declare this
stable, documented file outside all Firefox profile directories:

```nix
{ ... }:
let
  extensionId = "control-panel-for-youtube@jbscript.dev"; # Actual fork ID
in {
  home.file.".mozilla/managed-storage/${extensionId}.json".text =
    builtins.toJSON {
      name = extensionId;
      description = "Initial Control Panel for YouTube preferences";
      type = "storage";
      data.initialSettings = {
        enabled = true;
        hideShorts = true;
        redirectShorts = true;
        disableAutoplay = true;
      };
    };
}
```

Keep the extension's `normal_installed` installation policy separately. Use either
this native managed-data source **or** the `3rdparty` source for this extension,
not both; this example does not rely on precedence between competing sources.
This is `home.file`, not `xdg.configFile`: Firefox's documented per-user location
is `~/.mozilla/managed-storage/<extension-id>.json`. Sandboxed Firefox packaging
may expose a different home directory and needs deployment appropriate to that
package.

Deploy the file before the extension's first use, then restart Firefox. Subsequent
Home Manager activations may replace the managed manifest without changing users'
already-initialized local settings. This is not Home Manager's direct
`profiles.<name>.extensions.settings` profile-storage-file mechanism.

## Accepted preferences and types

The allowlist in `background.js` covers all normal boolean preferences from the
current options UI, including `enabled`, `hideShorts`, `redirectShorts`,
`stopShortsLooping`, `disableAutoplay`, `disableHomeFeed`, `hideComments`, and
`hideRelated`. Booleans must be JSON booleans, not strings such as `"true"`.
The regression test checks this allowlist against the options UI's defaults.

The following string preferences are also supported:

| Preference | Accepted strings |
| --- | --- |
| `enforceTheme` | `default`, `device`, `dark`, `light` |
| `minimumGridItemsPerRow` | `auto`, `+1`, `+2`, `+3`, `3`, `4`, `5`, `6` |
| `minimumShortsPerRow` | `auto`, `4`, `5`, `6`, `7`, `8`, `9` |
| `playerControlsBg` | `default`, `blur`, `transparent` |
| `searchThumbnailSize` | `large`, `medium`, `small`, `xsmall` |
| `snapshotFormat` | `jpeg`, `png` |
| `hideWatchedThreshold` | Integer strings from `0` to `100` (no leading zeroes) |
| `snapshotQuality` | Decimal strings in `[0, 1]`, for example `0.92`, `0`, `1.0` |

State fields such as `hiddenChannels`, `collapsedOptions`, `version`, all debug
options, the internal completion marker, and unknown keys are not accepted.
This intentional restriction prevents importing an arbitrary storage dump.
Future newly added options must be explicitly added to the allowlist and tests.

The extension already requests the `storage` permission; no separate Firefox
managed permission or Chromium managed-storage schema is added. This feature's
policy deployment targets Firefox. Browsers with no managed store retain their
normal local settings and defaults.

## Tests and deployment checks

Run the dependency-free Node regression tests from the repository root:

```sh
node --test scripts/managed-settings.test.cjs
node --check background.js
node --check content.js
node --check options.js
node --check embed.js
```

The suite executes the actual changed scripts with WebExtension/DOM mocks. It
covers fresh and existing profiles, concurrent initialization, user edits, policy
changes/removal, validation, read/write failures, all three client initialization
paths, and unmanaged-browser fallbacks. Tests live under `scripts/`, already
excluded from extension packages by the repository's build configuration.

A real Firefox smoke test remains necessary; the automated tests are not evidence
of a signed package installing or real YouTube DOM behavior. In a disposable test
profile, verify these cases before household deployment:

1. Provision the policy/native manifest before installing or loading this build.
   On fresh storage, open YouTube, an embedded player, and the options popup.
   Check that selected preferences appear and the toolbar reflects `enabled`.
2. Change a seeded option locally, restart Firefox, and verify that it stays
   changed. Then alter the managed data, restart again, and verify that neither
   old nor newly added policy keys override the initialized profile.
3. Upgrade an already configured profile to this build and confirm that no keys
   are added or overwritten. Include a profile with a saved `false` value.
4. Test an invalid payload in a fresh disposable profile. Confirm the extension
   logs a warning and does not partially seed. Correct it, keep local storage
   empty, restart Firefox, and verify the successful retry.
5. Verify behavior with no policy, and that the user can still change preferences
   and disable the normally installed extension.

For a development package, use the repository's existing tools:

```sh
npm install
npm run create-browser-action
npm run build-mv2
```

This produces an **unsigned build archive**, not a production-installable signed
XPI. Standard Firefox release builds require signing. Choose your own fork ID,
review the source's licensing/distribution permissions, and use Mozilla's unlisted
signing process for private/self-distribution. Developer signing credentials are
not needed on the users' machines. This feature neither creates a signed release
nor changes the fork's update/distribution configuration.

## References

- [Firefox storage.managed API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/managed)
- [Firefox 3rdparty policy](https://firefox-admin-docs.mozilla.org/reference/policies/3rdparty/)
- [Firefox ExtensionSettings policy](https://firefox-admin-docs.mozilla.org/reference/policies/extensionsettings/)
- [Native managed-storage manifests and locations](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests)
- [Home Manager Firefox options](https://nix-community.github.io/home-manager/options/home-manager/programs/firefox.html)
- [Extension IDs](https://extensionworkshop.com/documentation/develop/extensions-and-the-add-on-id/)
- [Signing and distribution](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/)
