document.title = chrome.i18n.getMessage('extensionName')

for (let optionValue of [
  'auto',
  'large',
  'medium',
  'small',
]) {
  let label = chrome.i18n.getMessage(optionValue)
  for (let $option of document.querySelectorAll(`option[value="${optionValue}"]`)) {
    $option.textContent = label
  }
}

for (let translationId of [
  'addTakeSnapshot',
  'alwaysUseOriginalAudio',
  'alwaysUseTheaterMode',
  'anyPercent',
  'disableAutoplay',
  'disableHomeFeed',
  'disableHomeFeedNote',
  'downloadTranscript',
  'embeddedVideos',
  'enabled',
  'fullSizeTheaterMode',
  'fullSizeTheaterModeHideHeader',
  'fullSizeTheaterModeHideScrollbar',
  'hideAI',
  'hideChannelBanner',
  'hideChannels',
  'hideChannelsNote',
  'hideChat',
  'hideComments',
  'hideEmbedPauseOverlay',
  'hideEmbedShareButton',
  'hideEndCards',
  'hideEndVideos',
  'hideExploreButton',
  'hideHiddenVideos',
  'hideHiddenVideosNote',
  'hideHomeCategories',
  'hideInfoPanels',
  'hideLive',
  'hideMembersOnly',
  'hideMerchEtc',
  'hideMetadata',
  'hideMiniplayerButton',
  'hideMixes',
  'hideMoviesAndTV',
  'hideNextButton',
  'hideNextButtonNote',
  'hideOpenApp',
  'hidePlaylists',
  'hideRelated',
  'hideShareThanksClip',
  'hideShorts',
  'hideShortsMetadataUntilHover',
  'hideSponsored',
  'hideStreamed',
  'hideSubscriptionsChannelList',
  'hideSubscriptionsLatestBar',
  'hideSuggestedSections',
  'hideUpcoming',
  'hideVoiceSearch',
  'hideWatched',
  'hideWatchedThreshold',
  'minimumGridItemsPerRow',
  'minimumGridItemsPerRowNote',
  'mobileGridView',
  'pauseChannelTrailers',
  'qualityFull',
  'qualityHigh',
  'qualityLow',
  'qualityMedium',
  'redirectShorts',
  'removePink',
  'searchThumbnailSize',
  'shorts',
  'skipAds',
  'snapshotFormat',
  'snapshotQuality',
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
/** @type {import("./types").OptionsConfig} */
let defaultConfig = {
  enabled: true,
  // Default based on platform until the content script runs
  version: /(Android|iP(ad|hone))/.test(navigator.userAgent) ? 'mobile' : 'desktop',
  disableAutoplay: true,
  disableHomeFeed: false,
  hiddenChannels: [],
  hideAI: true,
  hideChannelBanner: false,
  hideChannels: true,
  hideComments: false,
  hideHiddenVideos: true,
  hideHomeCategories: false,
  hideInfoPanels: false,
  hideLive: false,
  hideMembersOnly: false,
  hideMetadata: false,
  hideMixes: false,
  hideMoviesAndTV: false,
  hideNextButton: true,
  hidePlaylists: false,
  hideRelated: false,
  hideShareThanksClip: false,
  hideShorts: true,
  hideSponsored: true,
  hideStreamed: false,
  hideSuggestedSections: true,
  hideUpcoming: false,
  hideVoiceSearch: false,
  hideWatched: true,
  hideWatchedThreshold: '80',
  redirectShorts: true,
  removePink: false,
  skipAds: true,
  // Desktop only
  addTakeSnapshot: true,
  alwaysUseOriginalAudio: false,
  alwaysUseTheaterMode: false,
  downloadTranscript: true,
  fullSizeTheaterMode: false,
  fullSizeTheaterModeHideHeader: true,
  fullSizeTheaterModeHideScrollbar: false,
  hideChat: false,
  hideEndCards: false,
  hideEndVideos: true,
  hideMerchEtc: true,
  hideMiniplayerButton: false,
  hideShortsMetadataUntilHover: true,
  hideSubscriptionsLatestBar: false,
  minimumGridItemsPerRow: 'auto',
  pauseChannelTrailers: true,
  searchThumbnailSize: 'medium',
  snapshotFormat: 'jpeg',
  snapshotQuality: '0.92',
  tidyGuideSidebar: false,
  // Mobile only
  hideExploreButton: true,
  hideOpenApp: true,
  hideSubscriptionsChannelList: false,
  mobileGridView: true,
  // Embedded videos
  hideEmbedPauseOverlay: true,
  hideEmbedShareButton: false,
}
//#endregion

/** @type {import("./types").OptionsConfig} */
let optionsConfig

let $hiddenChannels = /** @type {HTMLElement} */ (document.querySelector('#hiddenChannels'))
let $hiddenChannelsDetails = /** @type {HTMLDetailsElement} */ (document.querySelector('#hiddenChannelsDetails'))
let $hiddenChannelsSummary = /** @type {HTMLElement} */ (document.querySelector('#hiddenChannelsSummary'))

/**
 * @param {keyof HTMLElementTagNameMap} tagName
 * @param {({[key: string]: any} | null)?} attributes
 * @param {...any} children
 * @returns {HTMLElement}
 */
function h(tagName, attributes, ...children) {
  let $el = document.createElement(tagName)

  if (attributes) {
    for (let [prop, value] of Object.entries(attributes)) {
      if (prop.startsWith('on') && typeof value == 'function') {
        $el.addEventListener(prop.slice(2).toLowerCase(), value)
      } else {
        $el[prop] = value
      }
    }
  }

  for (let child of children) {
    if (child == null || child === false) continue
    if (child instanceof Node) {
      $el.appendChild(child)
    } else {
      $el.insertAdjacentText('beforeend', String(child))
    }
  }

  return $el
}

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
 * @param {Partial<import("./types").OptionsConfig>} changes
 */
function storeConfigChanges(changes) {
  chrome.storage.local.onChanged.removeListener(onStorageChanged)
  chrome.storage.local.set(changes, () => {
    chrome.storage.local.onChanged.addListener(onStorageChanged)
  })
}

function shouldDisplayHiddenChannels() {
  return optionsConfig.hideChannels && optionsConfig.hiddenChannels.length > 0
}

function updateDisplay() {
  $body.classList.toggle('desktop', optionsConfig.version == 'desktop')
  $body.classList.toggle('disabled', !optionsConfig.enabled)
  $body.classList.toggle('fullSizeTheaterMode', optionsConfig.fullSizeTheaterMode)
  $body.classList.toggle('hiddenChannels', shouldDisplayHiddenChannels())
  $body.classList.toggle('hidingWatched', optionsConfig.hideWatched)
  $body.classList.toggle('jpegSnapshot', optionsConfig.snapshotFormat == 'jpeg')
  $body.classList.toggle('mobile', optionsConfig.version == 'mobile')
  $body.classList.toggle('snapshot', optionsConfig.addTakeSnapshot)
  updateHiddenChannelsDisplay()
}

function updateHiddenChannelsDisplay() {
  if (!shouldDisplayHiddenChannels()) return

  $hiddenChannelsSummary.textContent = chrome.i18n.getMessage('hiddenChannelsSummary', String(optionsConfig.hiddenChannels.length))

  if (!$hiddenChannelsDetails.open) return

  while ($hiddenChannels.hasChildNodes()) $hiddenChannels.firstChild.remove()
  for (let [index, {name}] of optionsConfig.hiddenChannels.entries()) {
    $hiddenChannels.appendChild(
      h('section', null,
        h('label', {className: 'button'},
          h('span', null, name),
          h('button', {
            type: 'button',
            onclick() {
              optionsConfig.hiddenChannels = optionsConfig.hiddenChannels.filter((_, i) => i != index)
              storeConfigChanges({hiddenChannels: optionsConfig.hiddenChannels})
              updateDisplay()
            }
          }, '×')
        )
      )
    )
  }
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
    $hiddenChannelsDetails.addEventListener('toggle', updateHiddenChannelsDisplay)
    chrome.storage.local.onChanged.addListener(onStorageChanged)

    $body.classList.toggle('debug', Boolean(optionsConfig.debug || optionsConfig.debugManualHiding))
    if (!optionsConfig.debug && !optionsConfig.debugManualHiding) {
      let $version = document.querySelector('#version')
      let $debugCountdown = document.querySelector('#debugCountdown')
      let debugCountdown = 5

      function onClick(e) {
        if (e.target === $version || $version.contains(/** @type {Node} */ (e.target))) {
          debugCountdown--
        } else {
          debugCountdown = 5
        }

        if (debugCountdown == 0) {
          $body.classList.add('debug')
          $debugCountdown.textContent = ''
          $form.removeEventListener('click', onClick)
        }
        else if (debugCountdown <= 3) {
          $debugCountdown.textContent = ` (${debugCountdown})`
        }
      }

      $form.addEventListener('click', onClick)
    }
  })
}

main()
//#endregion