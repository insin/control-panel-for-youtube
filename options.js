document.title = chrome.i18n.getMessage('extensionName')

for (let translationId of [
  'disableAutoplay',
  'enabled',
  'experimentalFeatures',
  'fillGaps',
  'fillGapsNote',
  'hideChat',
  'hideComments',
  'hideEndCards',
  'hideEndVideos',
  'hideExploreButton',
  'hideLive',
  'hideMerchEtc',
  'hideMetadata',
  'hideMixes',
  'hideOpenApp',
  'hideRelated',
  'hideSearchSuggestions',
  'hideShorts',
  'hideSponsored',
  'hideStreamed',
  'hideUpcoming',
  'hideWatched',
  'hideWatchedThreshold',
  'redirectShorts',
  'tidyGuideSidebar',
  'uiTweaks',
  'videoLists',
  'videoPages',
]) {
  document.getElementById(translationId).textContent = chrome.i18n.getMessage(translationId)
}

let $body = document.body
let $form = document.querySelector('form')

if (navigator.userAgent.includes('Safari/') && !/Chrom(e|ium)\//.test(navigator.userAgent)) {
  $body.classList.add('safari', /iP(ad|hone)/.test(navigator.userAgent) ? 'iOS' : 'macOS')
} else {
  $body.classList.toggle('edge', navigator.userAgent.includes('Edg/'))
}

//#region Default config
/** @type {import("./types").Config} */
let defaultConfig = {
  // Default based on platform until the content script runs
  version: /(Android|iP(ad|hone))/.test(navigator.userAgent) ? 'mobile' : 'desktop',
  disableAutoplay: true,
  enabled: true,
  hideComments: false,
  hideLive: false,
  hideMerchEtc: true,
  hideMetadata: false,
  hideMixes: false,
  hideRelated: false,
  hideSearchSuggestions: true,
  hideShorts: true,
  hideSponsored: true,
  hideStreamed: false,
  hideUpcoming: false,
  hideWatched: false,
  hideWatchedThreshold: '100',
  redirectShorts: true,
  // Desktop only
  fillGaps: false,
  hideChat: false,
  hideEndCards: false,
  hideEndVideos: false,
  tidyGuideSidebar: false,
  // Mobile only
  hideExploreButton: true,
  hideOpenApp: true,
}
//#endregion

/** @type {import("./types").Config} */
let optionsConfig

/**
 * @param {Event} e
 */
function onFormChanged(e) {
  let $el = /** @type {HTMLInputElement} */ (e.target)
  let prop = $el.name
  let value = $el.type == 'checkbox' ? $el.checked : $el.value
  optionsConfig[prop] = value
  storeConfigChanges({[prop]: value})
  updateDisplay()
}

/**
 * @param {{[key: string]: chrome.storage.StorageChange}} changes
 */
function onStorageChanged(changes) {
  for (let prop in changes) {
    optionsConfig[prop] = changes[prop].newValue
    setFormValue(prop, changes[prop].newValue)
  }
  updateDisplay()
}

function setFormValue(prop, value) {
  if (!$form.elements.hasOwnProperty(prop)) return

  let $el = /** @type {HTMLInputElement} */ ($form.elements[prop])
  if ($el.type == 'checkbox') {
    $el.checked = value
  } else {
    $el.value = value
  }
}

/**
 * Store config changes without triggering this page's own listener.
 * @param {Partial<import("./types").Config>} changes
 */
function storeConfigChanges(changes) {
  chrome.storage.local.onChanged.removeListener(onStorageChanged)
  chrome.storage.local.set(changes, () => {
    chrome.storage.local.onChanged.addListener(onStorageChanged)
  })
}

function updateDisplay() {
  $body.classList.toggle('desktop', optionsConfig.version == 'desktop')
  $body.classList.toggle('disabled', !optionsConfig.enabled)
  $body.classList.toggle('hidingWatched', optionsConfig.hideWatched)
  $body.classList.toggle('mobile', optionsConfig.version == 'mobile')
}

//#region Main
function main() {
  chrome.storage.local.get((storedConfig) => {
    optionsConfig = {...defaultConfig, ...storedConfig}

    for (let [prop, value] of Object.entries(optionsConfig)) {
      setFormValue(prop, value)
    }

    updateDisplay()

    $form.addEventListener('change', onFormChanged)
    chrome.storage.local.onChanged.addListener(onStorageChanged)
  })
}

main()
//#endregion