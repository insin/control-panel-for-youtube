//#region Theme hooks
/** @type {'chrome' | 'edge' | 'firefox' | 'ios' | 'mac'} */
let browser = (() => {
  let ua = navigator.userAgent.toLowerCase()
  if (ua.includes('firefox')) return 'firefox'
  else if (ua.includes('edg/')) return 'edge'
  else if (ua.includes('safari') && !ua.includes('chrome'))
    return ua.includes('iphone') || ua.includes('ipad') ? 'ios' : 'mac'
  return 'chrome'
})()
let theme = browser
document.body.classList.add(`browser-${browser}`, theme)

if (theme == 'chrome' || theme == 'edge' || theme == 'firefox') {
  let $top = document.createElement('div')
  $top.className = 'stickySentinel top'
  let $bottom = document.createElement('div')
  $bottom.className = 'stickySentinel bottom'
  for (let $group of document.querySelectorAll('section.group.labelled')) {
    $group.prepend($top.cloneNode())
    $group.insertBefore($bottom.cloneNode(), $group.lastElementChild)
  }
}
//#endregion

//#region Localisation
document.title = chrome.i18n.getMessage('extensionName')

for (let optionValue of [
  'auto',
  'blur',
  'dark',
  'default',
  'device',
  'large',
  'light',
  'medium',
  'small',
  'transparent',
  'xsmall',
]) {
  let label = chrome.i18n.getMessage(optionValue)
  for (let $option of document.querySelectorAll(`option[value="${optionValue}"]`)) {
    $option.textContent = label
  }
}

for (let gridItemsRelative of [1, 2, 3]) {
  let $option = document.querySelector(`select[name="minimumGridItemsPerRow"] option[value="+${gridItemsRelative}"]`)
  if ($option) {
    $option.textContent = chrome.i18n.getMessage('autoPlusX', [gridItemsRelative])
  } else {
    console.warn('could not find <option> for gridItemsRelative', gridItemsRelative)
  }
}

for (let gridItemsMinimum of [3, 4, 5, 6]) {
  let $option = document.querySelector(`select[name="minimumGridItemsPerRow"] option[value="${gridItemsMinimum}"]`)
  if ($option) {
    $option.textContent = chrome.i18n.getMessage('atLeastX', [gridItemsMinimum])
  } else {
    console.warn('could not find <option> for gridItemsMinimum', gridItemsMinimum)
  }
}

for (let translationId of [
  'addTakeSnapshot',
  'ads',
  'allowBackgroundPlay',
  'alwaysShowShortsProgressBar',
  'alwaysUseOriginalAudio',
  'alwaysUseTheaterMode',
  'animateHiding',
  'annoyances',
  'anyPercent',
  'blockAds',
  'blockAdsNote',
  'debug',
  'debugLogGridObservers',
  'debugManualHiding',
  'debugManualHidingNote',
  'debugNote',
  'debugOptions',
  'disableAmbientMode',
  'disableAutoplay',
  'disableHomeFeed',
  'disableHomeFeedNote',
  'disableTheaterBigMode',
  'disableThemedHover',
  'disableThemedHoverNote',
  'disableVideoPreviews',
  'displayHomeGridAsList',
  'displaySubscriptionsGridAsList',
  'downloadTranscript',
  'embeddedVideos',
  'enabled',
  'enforceTheme',
  'fixGhostCards',
  'fullSizeTheaterMode',
  'fullSizeTheaterModeHideHeader',
  'gridItemsPerRow',
  'hideAI',
  'hideAskButton',
  'hideAutoDubbed',
  'hideAutoDubbedNote',
  'hideChannelBanner',
  'hideChannelWatermark',
  'hideChannels',
  'hideChannelsNote',
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
  'hideHiddenVideosNote',
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
  'hideNextButtonNote',
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
  'hideSponsored',
  'hideStreamed',
  'hideSubscriptionsChannelList',
  'hideSubscriptionsLatestBar',
  'hideSuggestedSections',
  'hideUpcoming',
  'hideVoiceSearch',
  'hideWatched',
  'hideWatchedThreshold',
  'mobileGridView',
  'newVideoPlayerUI',
  'pauseChannelTrailers',
  'playerControlsBg',
  'playerFixFullScreenButton',
  'playerHideFullScreenControls',
  'playerHideFullScreenMoreVideos',
  'playerHideFullScreenTitle',
  'playerHideFullScreenVoting',
  'playerRemoveDelhiExperimentFlags',
  'playerRemoveDelhiExperimentFlagsNote',
  'qualityFull',
  'qualityHigh',
  'qualityLow',
  'qualityMedium',
  'recentChanges',
  'redirectLogoToSubscriptions',
  'redirectShorts',
  'removePink',
  'restoreMiniplayerButton',
  'restoreSidebarSubscriptionsLink',
  'revertGiantRelated',
  'revertSidebarOrder',
  'searchThumbnailSize',
  'shorts',
  'showChannelHeadersInListView',
  'showFullVideoTitles',
  'snapshotFormat',
  'snapshotQuality',
  'stopShortsLooping',
  'tidyGuideSidebar',
  'uiTweaks',
  'useSquareCorners',
  'videoLists',
  'videoPages',
]) {
  let $el = document.getElementById(translationId)
  if ($el) {
    $el.textContent = chrome.i18n.getMessage(translationId)
  } else {
    console.warn('could not find element for translationId', translationId)
  }
}

for (let translationClass of [
  'inHomeAndSubscriptionsNote',
]) {
  let translation = chrome.i18n.getMessage(translationClass)
  for (let $el of document.querySelectorAll(`.${translationClass}`)) {
    $el.textContent = translation
  }
}
//#endregion

//#region Default config
let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
/** @type {import("./types").OptionsConfig} */
let defaultConfig = {
  enabled: true,
  collapsedOptions: [],
  // Default based on platform until the content script runs
  version: /(Android|iP(ad|hone))/.test(navigator.userAgent) ? 'mobile' : 'desktop',
  alwaysShowShortsProgressBar: true,
  blockAds: true,
  disableAmbientMode: true,
  disableAutoplay: true,
  disableHomeFeed: false,
  disableTheaterBigMode: true,
  hiddenChannels: [],
  hideAI: true,
  hideAskButton: false,
  hideAutoDubbed: false,
  hideChannelBanner: false,
  hideChannelWatermark: true,
  hideChannels: true,
  hideComments: false,
  hideHiddenVideos: true,
  hideHomeCategories: false,
  hideInfoPanels: true,
  hideLive: false,
  hideLowViews: true,
  hideMembersOnly: true,
  hideMetadata: true,
  hideMixes: true,
  hideMoviesAndTV: false,
  hideNextButton: true,
  hidePlaylists: false,
  hidePremiumUpsells: true,
  hideRelated: true,
  hideShareThanksClip: false,
  hideShorts: true,
  hideShortsMusicLink: true,
  hideShortsRelatedLink: true,
  hideShortsSuggestedActions: true,
  hideSponsored: true,
  hideStreamed: true,
  hideSuggestedSections: true,
  hideUpcoming: true,
  hideVoiceSearch: true,
  hideWatched: true,
  hideWatchedThreshold: '85',
  playerHideFullScreenControls: false,
  playerHideFullScreenMoreVideos: true,
  redirectShorts: true,
  removePink: true,
  showFullVideoTitles: false,
  stopShortsLooping: true,
  useSquareCorners: false,
  // Desktop only
  addTakeSnapshot: true,
  alwaysUseOriginalAudio: true,
  alwaysUseTheaterMode: false,
  animateHiding: !prefersReducedMotion,
  disableThemedHover: true,
  disableVideoPreviews: false,
  displayHomeGridAsList: false,
  displaySubscriptionsGridAsList: false,
  downloadTranscript: true,
  enforceTheme: 'default',
  fixGhostCards: true,
  fullSizeTheaterMode: false,
  fullSizeTheaterModeHideHeader: true,
  hideChat: false,
  hideChatFullScreen: false,
  hideCollaborations: true,
  hideEndCards: true,
  hideEndVideos: true,
  hideExperiencingInterruptions: false,
  hideJumpAheadButton: false,
  hideMerchEtc: true,
  hideRelatedBelow: true,
  hideSidebarSubscriptions: false,
  hideShortsMetadataUntilHover: true,
  hideShortsRemixButton: true,
  hideSubscriptionsLatestBar: true,
  minimumGridItemsPerRow: '+1',
  minimumShortsPerRow: '8',
  pauseChannelTrailers: true,
  playerControlsBg: 'default',
  playerFixFullScreenButton: true,
  playerHideFullScreenTitle: true,
  playerHideFullScreenVoting: true,
  playerRemoveDelhiExperimentFlags: false,
  redirectLogoToSubscriptions: false,
  restoreMiniplayerButton: true,
  restoreSidebarSubscriptionsLink: true,
  revertGiantRelated: true,
  revertSidebarOrder: true,
  searchThumbnailSize: 'xsmall',
  snapshotFormat: 'jpeg',
  snapshotQuality: '0.92',
  showChannelHeadersInListView: true,
  tidyGuideSidebar: true,
  // Mobile only
  allowBackgroundPlay: true,
  hideExploreButton: true,
  hideHomePosts: true,
  hideOpenApp: true,
  hideSubscriptionsChannelList: true,
  mobileGridView: true,
  // Embedded videos
  hideEmbedPauseOverlay: true,
  hideEmbedShareButton: true,
}
//#endregion

//#region Config & variables
/** @type {import("./types").OptionsConfig} */
let optionsConfig

let $body = document.body
let $collapsibleLabels = document.querySelectorAll('section.labelled.collapsible > label[data-collapse-id]')
let $form = document.querySelector('form')
let $hiddenChannels = /** @type {HTMLElement} */ (document.querySelector('#hiddenChannels'))
let $hiddenChannelsDetails = /** @type {HTMLDetailsElement} */ (document.querySelector('#hiddenChannelsDetails'))
let $hiddenChannelsSummary = /** @type {HTMLElement} */ (document.querySelector('#hiddenChannelsSummary'))
let $optionsIcon = /** @type {HTMLImageElement} */ (document.querySelector('#optionsIcon'))
let $stickySentinels = document.querySelectorAll('.stickySentinel')
//#endregion

//#region Utility functions
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
//#endregion

//#region Options page functions
function onToggleCollapse(e) {
  if (theme == 'ios') return
  let collapsedOptions = optionsConfig.collapsedOptions.slice()
  let collapseId = e.currentTarget.getAttribute('data-collapse-id')
  let index = collapsedOptions.indexOf(collapseId)
  if (index == -1) {
    collapsedOptions.push(collapseId)
  } else {
    collapsedOptions.splice(index, 1)
  }
  optionsConfig.collapsedOptions = collapsedOptions
  storeConfigChanges({collapsedOptions})
  updateDisplay()
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
  $body.classList.toggle('debugging', optionsConfig.debug)
  $body.classList.toggle('desktop', optionsConfig.version == 'desktop')
  $body.classList.toggle('disabled', !optionsConfig.enabled)
  $body.classList.toggle('displayingGridAsList',  optionsConfig.displayHomeGridAsList || optionsConfig.displaySubscriptionsGridAsList)
  $body.classList.toggle('fullSizeTheaterMode', optionsConfig.fullSizeTheaterMode)
  $body.classList.toggle('hiddenChannels', shouldDisplayHiddenChannels())
  $body.classList.toggle('hidingHiddenVideos', optionsConfig.hideHiddenVideos)
  $body.classList.toggle('hidingWatched', optionsConfig.hideWatched)
  $body.classList.toggle('jpegSnapshot', optionsConfig.snapshotFormat == 'jpeg')
  $body.classList.toggle('mobile', optionsConfig.version == 'mobile')
  $body.classList.toggle('snapshot', optionsConfig.addTakeSnapshot)
  $body.classList.toggle('tidyingGuideSidebar', optionsConfig.tidyGuideSidebar)
  let icon = `options-icon${!optionsConfig.enabled ? '-disabled' : ''}.png`
  if ($optionsIcon.src != icon) {
    $optionsIcon.src = icon
  }
  updateCollapsedOptionsDisplay()
  updateHiddenChannelsDisplay()
}

function updateCollapsedOptionsDisplay() {
  for (let $label of $collapsibleLabels) {
    $label.parentElement.classList.toggle('collapsed', optionsConfig.collapsedOptions.includes($label.getAttribute('data-collapse-id')))
  }
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
//#endregion

//#region Main
function main() {
  chrome.storage.local.get((storedConfig) => {
    optionsConfig = {...defaultConfig, ...storedConfig}

    for (let [prop, value] of Object.entries(optionsConfig)) {
      setFormValue(prop, value)
    }

    updateDisplay()

    $form.addEventListener('change', onFormChanged)
    for (let $label of $collapsibleLabels) {
      $label.addEventListener('click', onToggleCollapse)
    }
    $hiddenChannelsDetails.addEventListener('toggle', updateHiddenChannelsDisplay)
    let stickyObserver = new IntersectionObserver((entries) => {
      for (let entry of entries) {
        let $label = entry.target.parentElement.querySelector('label')
        if (entry.target.classList.contains('top')) {
          $label.classList.toggle('stuck', !entry.isIntersecting && entry.boundingClientRect.top < 0)
        }
        if (entry.target.classList.contains('bottom')) {
          $label.classList.toggle('force-static', !entry.isIntersecting && entry.boundingClientRect.top < 0)
        }
      }
    })
    for (let $sentinel of $stickySentinels) {
      stickyObserver.observe($sentinel)
    }
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