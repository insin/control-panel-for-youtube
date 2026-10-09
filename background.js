//#region Constants
const IS_SAFARI = location.protocol.startsWith('safari-web-extension:')

const DISABLED_ICONS = {
  16: 'icons/icon16-disabled.png',
  32: 'icons/icon32-disabled.png',
  48: 'icons/icon48-disabled.png',
  64: 'icons/icon64-disabled.png',
  96: 'icons/icon96-disabled.png',
  128: 'icons/icon128-disabled.png',
}

const ENABLED_ICONS = {
  16: 'icons/icon16.png',
  32: 'icons/icon32.png',
  48: 'icons/icon48.png',
  64: 'icons/icon64.png',
  96: 'icons/icon96.png',
  128: 'icons/icon128.png',
}
//#endregion

// Only preference values may be provisioned, never profile/UI state or identifiers.
// Keep this allowlist in sync with the public defaults in options.js (covered by tests).
const INITIAL_SETTINGS_MARKER = '__cpfyInitialSettingsApplied'
const INITIAL_SETTINGS_BOOLEAN_KEYS = new Set([
  'addTakeSnapshot',
  'allowBackgroundPlay',
  'alwaysShowShortsProgressBar',
  'alwaysUseOriginalAudio',
  'alwaysUseTheaterMode',
  'animateHiding',
  'blockAds',
  'disableAmbientMode',
  'disableAutoplay',
  'disableHomeFeed',
  'disableNumberKeySeeking',
  'disableStableVolume',
  'disableThemedHover',
  'disableVideoPreviews',
  'displayHomeGridAsList',
  'displaySubscriptionsGridAsList',
  'downloadTranscript',
  'enabled',
  'fixGhostCards',
  'fullSizeTheaterMode',
  'fullSizeTheaterModeHideHeader',
  'fullWidthChannelPage',
  'hideAI',
  'hideAskButton',
  'hideAutoDubbed',
  'hideChannelBanner',
  'hideChannelWatermark',
  'hideChannels',
  'hideChat',
  'hideChatFullScreen',
  'hideCollaborations',
  'hideComments',
  'hideEmbedPauseOverlay',
  'hideEmbedShareButton',
  'hideEndCards',
  'hideEndVideos',
  'hideExperiencingInterruptions',
  'hideExploreButton',
  'hideHiddenVideos',
  'hideHomeCategories',
  'hideHomePosts',
  'hideInfoPanels',
  'hideJumpAheadButton',
  'hideLive',
  'hideLowViews',
  'hideMembersOnly',
  'hideMerchEtc',
  'hideMetadata',
  'hideMixes',
  'hideMoviesAndTV',
  'hideNextButton',
  'hideOpenApp',
  'hidePlaylists',
  'hidePremiumUpsells',
  'hideRelated',
  'hideRelatedBelow',
  'hideShareThanksClip',
  'hideShorts',
  'hideShortsMetadataUntilHover',
  'hideShortsMusicLink',
  'hideShortsRelatedLink',
  'hideShortsRemixButton',
  'hideShortsSuggestedActions',
  'hideSidebarSubscriptions',
  'hideSidebarWhenEmpty',
  'hideSponsored',
  'hideStreamed',
  'hideSubscriptionsChannelList',
  'hideSubscriptionsLatestBar',
  'hideSuggestedSections',
  'hideUpcoming',
  'hideVoiceSearch',
  'hideWatchSideMenu',
  'hideWatched',
  'mobileGridView',
  'pauseChannelTrailers',
  'playerFixFullScreenButton',
  'playerHideFullScreenControls',
  'playerHideFullScreenMoreActions',
  'playerHideFullScreenMoreVideos',
  'playerHideFullScreenTitle',
  'playerHideFullScreenVoting',
  'playerRemoveDelhiExperimentFlags',
  'redirectLogoToSubscriptions',
  'redirectShorts',
  'removePink',
  'restoreMiniplayerButton',
  'restoreSidebarSubscriptionsLink',
  'revertGiantRelated',
  'revertSidebarOrder',
  'showChannelHeadersInListView',
  'showFullVideoTitles',
  'stopShortsLooping',
  'tidyGuideSidebar',
  'useSquareCorners',
])

/** @type {Record<string, string[]>} */
const INITIAL_SETTINGS_ENUMS = {
  enforceTheme: ['default', 'device', 'dark', 'light'],
  minimumGridItemsPerRow: ['auto', '+1', '+2', '+3', '3', '4', '5', '6'],
  minimumShortsPerRow: ['auto', '4', '5', '6', '7', '8', '9'],
  playerControlsBg: ['default', 'blur', 'transparent'],
  searchThumbnailSize: ['large', 'medium', 'small', 'xsmall'],
  snapshotFormat: ['jpeg', 'png'],
}

/** @type {Promise<void> | null} */
let managedSettingsInitialization = null

//#region One-time administrator defaults
/**
 * Validate the whole payload before writing anything. Reject unknown keys instead
 * of accidentally copying an extension storage dump or consuming a typoed seed.
 * @param {unknown} value
 * @returns {Record<string, boolean | string>}
 */
function validateInitialSettings(value) {
  if (value == null || typeof value != 'object' || Array.isArray(value)) {
    throw new Error('initialSettings must be an object')
  }

  /** @type {Record<string, boolean | string>} */
  let settings = {}
  for (let [key, item] of Object.entries(value)) {
    let valid = false
    if (INITIAL_SETTINGS_BOOLEAN_KEYS.has(key)) {
      valid = typeof item == 'boolean'
    } else if (Object.prototype.hasOwnProperty.call(INITIAL_SETTINGS_ENUMS, key)) {
      valid = typeof item == 'string' && INITIAL_SETTINGS_ENUMS[key].includes(item)
    } else if (key == 'hideWatchedThreshold') {
      valid = typeof item == 'string' && /^(?:[0-9]|[1-9][0-9]|100)$/.test(item)
    } else if (key == 'snapshotQuality') {
      valid = typeof item == 'string' && /^(?:0(?:\.[0-9]+)?|1(?:\.0+)?)$/.test(item)
    }
    if (!valid) throw new Error(`Invalid or unsupported initialSettings key: ${key}`)
    settings[key] = item
  }
  return settings
}

/**
 * Use the callback API shared by all supported browsers, and consume lastError
 * inside its callback. A failed local read must never be mistaken for empty storage.
 * @param {chrome.storage.StorageArea} area
 * @param {string | null} [key]
 * @returns {Promise<Record<string, any>>}
 */
function readSettingsStorage(area, key = null) {
  return new Promise((resolve, reject) => {
    area.get(key, (items) => {
      let error = chrome.runtime.lastError
      if (error) {
        reject(new Error(error.message))
      } else if (items == null || typeof items != 'object' || Array.isArray(items)) {
        reject(new Error('Settings storage returned an invalid result'))
      } else {
        resolve(items)
      }
    })
  })
}

/** @returns {Promise<void>} */
async function seedManagedSettings() {
  if (!chrome.storage.managed) return

  // This is deliberately whole-profile initialization, not a per-key merge.
  // Even legacy state or a single explicit false value makes a profile nonempty.
  if (Object.keys(await readSettingsStorage(chrome.storage.local)).length > 0) return

  let managed
  try {
    managed = await readSettingsStorage(chrome.storage.managed, 'initialSettings')
  } catch {
    // Firefox rejects when there is no managed manifest/policy. Other browsers
    // may expose storage.managed but require a schema. Leave their defaults alone.
    return
  }
  if (!Object.prototype.hasOwnProperty.call(managed, 'initialSettings')) return

  let settings
  try {
    settings = validateInitialSettings(managed.initialSettings)
  } catch (error) {
    console.warn('[managed defaults]', error.message)
    return
  }

  // Check again after the asynchronous policy read in case another context wrote.
  if (Object.keys(await readSettingsStorage(chrome.storage.local)).length > 0) return

  // Preferences and completion marker are submitted together. Future restarts,
  // updates, policy changes, or removal of individual keys never reapply the seed.
  await new Promise((resolve, reject) => {
    chrome.storage.local.set({...settings, [INITIAL_SETTINGS_MARKER]: true}, () => {
      let error = chrome.runtime.lastError
      if (error) reject(new Error(error.message))
      else resolve(undefined)
    })
  })
}

/** @returns {Promise<Record<string, any>>} */
async function getInitialConfig() {
  // Serialize concurrent startup, popup, page, and embed requests in one context.
  if (!managedSettingsInitialization) {
    managedSettingsInitialization = seedManagedSettings().catch((error) => {
      managedSettingsInitialization = null
      throw error
    })
  }
  await managedSettingsInitialization
  // Always reread local settings: user edits, not the seed, own the current values.
  return readSettingsStorage(chrome.storage.local)
}
//#endregion

//#region Functions
/**
 * @param {string} previous
 * @param {string} current
 * @param {string} threshold
 */
function crossesVersionThreshold(previous, current, threshold) {
  return isVersionLessThan(previous, threshold) && !isVersionLessThan(current, threshold)
}

/**
 * @param {string} v1
 * @param {string} v2
 */
function isVersionLessThan(v1, v2) {
  let a = v1.split('.').map(Number)
  let b = v2.split('.').map(Number)
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const diff = (a[i] || 0) - (b[i] || 0)
    if (diff < 0) return true
    if (diff > 0) return false
  }
  return false
}

function log(...messages) {
  console.log('[background]', ...messages)
}

function updateToolbarIcon(enabled) {
  let title = chrome.i18n.getMessage(enabled ? 'extensionName' : 'extensionNameDisabled')
  if (chrome.runtime.getManifest().manifest_version == 3) {
    chrome.action.setTitle({title})
    if (!IS_SAFARI) {
      chrome.action.setIcon({path: enabled ? ENABLED_ICONS : DISABLED_ICONS})
    } else {
      chrome.action.setBadgeText({text: enabled ? '' : '⏻'})
    }
  } else {
    chrome.browserAction.setTitle({title})
    chrome.browserAction.setIcon({path: enabled ? ENABLED_ICONS : DISABLED_ICONS})
  }
}
//#endregion

//#region Events
// Register synchronously so Firefox event pages / MV3 workers can wake for this.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type != 'get-initial-config' || sender.id != chrome.runtime.id) return
  getInitialConfig().then(sendResponse, (error) => {
    console.warn('[managed defaults] Initialization failed', error.message)
    sendResponse(null)
  })
  return true
})

chrome.runtime.onInstalled.addListener((details) => {
  log('chrome.runtime.onInstalled', {details})
  if (details.reason == 'install') {
    chrome.tabs.create({
      url: 'https://soitis.dev/control-panel-for-youtube/welcome',
    })
  }
  else if (details.reason == 'update') {
    let previous = details.previousVersion
    let current = chrome.runtime.getManifest().version
    let significantVersions = [
      crossesVersionThreshold(previous, current, '1.31') && '1.31',
    ].filter(Boolean)
    if (significantVersions.length > 0) {
      chrome.tabs.create({
        url: `https://soitis.dev/control-panel-for-youtube/updated?version=${significantVersions[0]}`,
        active: false,
      })
    }
  }
})

chrome.storage.local.onChanged.addListener((changes) => {
  if (changes.enabled) {
    updateToolbarIcon(changes.enabled.newValue)
  }
})
//#endregion

getInitialConfig().then(({enabled = true}) => {
  updateToolbarIcon(enabled)
}).catch((error) => {
  console.warn('[managed defaults] Initialization failed', error.message)
})