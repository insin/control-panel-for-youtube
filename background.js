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

chrome.storage.local.get({enabled: true}, ({enabled}) => {
  updateToolbarIcon(enabled)
})