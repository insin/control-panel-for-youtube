# [Control Panel for YouTube](https://soitis.dev/control-panel-for-youtube)

[![](icons/icon128.png)](https://soitis.dev/control-panel-for-youtube)

**Control Panel for YouTube is a browser extension which gives you more control over your YouTube experience by adding missing options and UI improvements**

> [!IMPORTANT]
> This is the support repository for Control Panel for YouTube - for installation links, information about the extension, and FAQs, please visit the [Control Panel for YouTube website](https://soitis.dev/control-panel-for-youtube).

Check the latest updates and availability for your browser on the [releases page](https://github.com/insin/control-panel-for-youtube/releases).

Follow [@soitis.dev](https://bsky.app/profile/soitis.dev) on Bluesky for extension news and other announcements.

## Support

To report a bug [create a new Issue](https://github.com/insin/control-panel-for-youtube/issues/new) here on GitHub.

Please include:

- The version of Control Panel for YouTube you're using
- The browser and operating system you're using it on
- Relevant URLs if applicable (e.g. a specific YouTube video a feature isn't working on)
- Relevant screenshots if applicable

If you don't have a GitHub account, you can use the [Browser Extension Feedback & Support form](https://soitis.dev/extensions/feedback) on our website instead, or email [extensions@soitis.dev](mailto:extensions@soitis.dev).

## New translations

If you would like to translate Control Panel for YouTube's options into your language, please create a copy of the English [messages.json](./_locales/en/messages.json) file, translate the `"message"` strings into your language, then create a new Issue and include the translated JSON.

Certain features also depend on translations in the `locales` objects in [content.js](./content.js#L118) and [page.js](./page.js#L24), which use the language code you can find in YouTube's `<html lang="…">` attribute.

## Thanks

- [@Catastravia](https://github.com/Catastravia) for [improving the Japanese translation](https://github.com/insin/control-panel-for-youtube/issues/22)
- [@movcoa](https://github.com/movcoa) for [providing a Chinese translation](https://github.com/insin/control-panel-for-youtube/issues/67)
- [@tohu-sand](https://github.com/tohu-sand) for [improving the Japanese translation](https://github.com/insin/control-panel-for-youtube/pull/68)

## Attribution

Icon adapted from "Floor hatch icon" by [Delapouite](https://delapouite.com/) from [game-icons.net](https://game-icons.net), [CC 3.0 BY](https://creativecommons.org/licenses/by/3.0/)
