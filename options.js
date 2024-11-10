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
  'anyPercent',
  'disableAutoplay',
  'disableHomeFeed',
  'disableHomeFeedNote',
  'downloadTranscript',
  'embeddedVideos',
  'enabled',
  'fullSizeTheaterMode',
  'hideChannels',
  'hideChannelsNote',
  'hideChat',
  'hideComments',
  'hideEmbedEndVideos',
  'hideEmbedPauseOverlay',
  'hideEmbedShareButton',
  'hideEndCards',
  'hideEndVideos',
  'hideExploreButton',
  'hideHiddenVideos',
  'hideHiddenVideosNote',
  'hideHomeCategories',
  'hideLive',
  'hideMerchEtc',
  'hideMetadata',
  'hideMiniplayerButton',
  'hideMixes',
  'hideNextButton',
  'hideNextButtonNote',
  'hideOpenApp',
  'hideRelated',
  'hideShareThanksClip',
  'hideShorts',
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
  'redirectShorts',
  'removePink',
  'searchThumbnailSize',
  'skipAds',
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
  hideChannels: true,
  hideComments: false,
  hideHiddenVideos: true,
  hideHomeCategories: false,
  hideLive: false,
  hideMetadata: false,
  hideMixes: false,
  hideNextButton: true,
  hideRelated: false,
  hideShareThanksClip: false,
  hideShorts: true,
  hideSponsored: true,
  hideStreamed: false,
  hideSuggestedSections: true,
  hideVoiceSearch: false,
  hideUpcoming: false,
  hideWatched: true,
  hideWatchedThreshold: '80',
  redirectShorts: true,
  removePink: false,
  skipAds: true,
  // Desktop only
  downloadTranscript: true,
  fullSizeTheaterMode: false,
  hideChat: false,
  hideEndCards: false,
  hideEndVideos: true,
  hideMerchEtc: true,
  hideMiniplayerButton: false,
  hideSubscriptionsLatestBar: false,
  minimumGridItemsPerRow: 'auto',
  searchThumbnailSize: 'medium',
  tidyGuideSidebar: false,
  // Mobile only
  hideExploreButton: true,
  hideOpenApp: true,
  hideSubscriptionsChannelList: false,
  mobileGridView: true,
  // Embedded videos
  hideEmbedEndVideos: true,
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
  $body.classList.toggle('hiddenChannels', shouldDisplayHiddenChannels())
  $body.classList.toggle('hidingWatched', optionsConfig.hideWatched)
  $body.classList.toggle('mobile', optionsConfig.version == 'mobile')
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