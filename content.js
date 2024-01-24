// ==UserScript==
// @name        Control Panel for YouTube
// @description Gives you more control over YouTube by adding missing options and UI improvements
// @namespace   https://github.com/insin/control-panel-for-youtube/
// @match       https://www.youtube.com/*
// @match       https://m.youtube.com/*
// @version     1
// ==/UserScript==
let debug = true

let mobile = location.hostname == 'm.youtube.com'
let desktop = !mobile
/** @type {import("./types").Version} */
let version = mobile ? 'mobile' : 'desktop'
let lang = mobile ? document.body.lang : document.documentElement.lang
let loggedIn = /(^|; )SID=/.test(document.cookie)

function log(...args) {
  if (debug) {
    console.log('🙋', ...args)
  }
}

function warn(...args) {
  if (debug) {
    console.log('❗️', ...args)
  }
}

//#region Default config
/** @type {import("./types").SiteConfig} */
let config = {
  enabled: true,
  version,
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
  hideShorts: false,
  hideSponsored: true,
  hideStreamed: false,
  hideUpcoming: false,
  hideVoiceSearch: false,
  hideWatched: false,
  hideWatchedThreshold: '100',
  redirectShorts: false,
  skipAds: true,
  // Desktop only
  downloadTranscript: true,
  fillGaps: true,
  hideChat: false,
  hideEndCards: false,
  hideEndVideos: false,
  hideMerchEtc: true,
  hideSubscriptionsLatestBar: false,
  hideSuggestedSections: true,
  tidyGuideSidebar: false,
  // Mobile only
  hideExploreButton: true,
  hideOpenApp: true,
  hideSubscriptionsChannelList: false,
  subscriptionsGridView: true,
}
//#endregion

//#region Locales
/**
 * @type {Record<string, import("./types").Locale>}
 */
const locales = {
  'en': {
    BREAKING_NEWS: 'Breaking news',
    CHANNELS_NEW_TO_YOU: 'Channels new to you',
    DOWNLOAD: 'Download',
    FOR_YOU: 'For you',
    FROM_RELATED_SEARCHES: 'From related searches',
    HIDE_CHANNEL: 'Hide channel',
    MIXES: 'Mixes',
    MUTE: 'Mute',
    NEXT_VIDEO: 'Next video',
    PEOPLE_ALSO_WATCHED: 'People also watched',
    POPULAR_TODAY: 'Popular today',
    PREVIOUSLY_WATCHED: 'Previously watched',
    PREVIOUS_VIDEO: 'Previous video',
    RECOMMENDED: 'Recommended',
    SHORTS: 'Shorts',
    STREAMED_TITLE: 'views Streamed',
    TELL_US_WHY: 'Tell us why',
  },
  'ja-JP': {
    BREAKING_NEWS: 'ニュース速報',
    CHANNELS_NEW_TO_YOU: '未視聴のチャンネル',
    DOWNLOAD: 'オフライン',
    FOR_YOU: 'あなたへのおすすめ',
    FROM_RELATED_SEARCHES: '関連する検索から',
    HIDE_CHANNEL: 'チャンネルを隠す',
    MIXES: 'ミックス',
    MUTE: 'ミュート（消音）',
    NEXT_VIDEO: '次の動画',
    PEOPLE_ALSO_WATCHED: '他の人はこちらも視聴しています',
    POPULAR_TODAY: '今日の人気動画',
    PREVIOUSLY_WATCHED: '前に再生した動画',
    PREVIOUS_VIDEO: '前の動画',
    RECOMMENDED: 'あなたへのおすすめ',
    SHORTS: 'ショート',
    STREAMED_TITLE: '前 に配信済み',
    TELL_US_WHY: '理由を教えてください',
  }
}

/**
 * @param {import("./types").LocaleKey} code
 * @returns {string}
 */
function getString(code) {
  return (locales[lang] || locales['en'])[code] || locales['en'][code];
}
//#endregion

const undoHideDelayMs = 5000

const Svgs = {
  DELETE: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" style="pointer-events: none; display: block; width: 100%; height: 100%;"><path d="M11 17H9V8h2v9zm4-9h-2v9h2V8zm4-4v1h-1v16H6V5H5V4h4V3h6v1h4zm-2 1H7v15h10V5z"></path></svg>',
}

//#region State
/** @type {() => void} */
let onAdRemoved
/** @type {Map<string, import("./types").CustomMutationObserver>} */
let globalObservers = new Map()
/** @type {import("./types").Channel} */
let lastClickedChannel
/** @type {HTMLElement} */
let $lastClickedElement
/** @type {() => void} */
let onDialogClosed
/** @type {Map<string, import("./types").CustomMutationObserver>} */
let pageObservers = new Map()
//#endregion

//#region Utility functions
function addStyle(css = '') {
  let $style = document.createElement('style')
  $style.dataset.insertedBy = 'control-panel-for-youtube'
  if (css) {
    $style.textContent = css
  }
  document.head.appendChild($style)
  return $style
}

function currentUrlChanges() {
  let currentUrl = getCurrentUrl()
  return () => currentUrl != getCurrentUrl()
}

/**
 * @param {string} str
 * @return {string}
 */
function dedent(str) {
  str = str.replace(/^[ \t]*\r?\n/, '')
  let indent = /^[ \t]+/m.exec(str)
  if (indent) str = str.replace(new RegExp('^' + indent[0], 'gm'), '')
  return str.replace(/(\r?\n)[ \t]+$/, '$1')
}

/** @param {Map<string, import("./types").CustomMutationObserver>} observers */
function disconnectObservers(observers, scope) {
  if (observers.size == 0) return
  log(
    `disconnecting ${observers.size} ${scope} observer${s(pageObservers.size)}`,
    Array.from(observers.values(), observer => observer.name)
  )
  logObserverDisconnects = false
  for (let observer of pageObservers.values()) observer.disconnect()
  logObserverDisconnects = true
}

function getCurrentUrl() {
  return location.origin + location.pathname + location.search
}

/**
 * @typedef {{
 *   name?: string
 *   stopIf?: () => boolean
 *   timeout?: number
 *   context?: Document | HTMLElement
 * }} GetElementOptions
 *
 * @param {string} selector
 * @param {GetElementOptions} options
 * @returns {Promise<HTMLElement | null>}
 */
function getElement(selector, {
 name = null,
 stopIf = null,
 timeout = Infinity,
 context = document,
} = {}) {
 return new Promise((resolve) => {
   let startTime = Date.now()
   let rafId
   let timeoutId

   function stop($element, reason) {
     if ($element == null) {
       warn(`stopped waiting for ${name || selector} after ${reason}`)
     }
     else if (Date.now() > startTime) {
       log(`${name || selector} appeared after ${Date.now() - startTime}ms`)
     }
     if (rafId) {
       cancelAnimationFrame(rafId)
     }
     if (timeoutId) {
       clearTimeout(timeoutId)
     }
     resolve($element)
   }

   if (timeout !== Infinity) {
     timeoutId = setTimeout(stop, timeout, null, `${timeout}ms timeout`)
   }

   function queryElement() {
     let $element = context.querySelector(selector)
     if ($element) {
       stop($element)
     }
     else if (stopIf?.() === true) {
       stop(null, 'stopIf condition met')
     }
     else {
       rafId = requestAnimationFrame(queryElement)
     }
   }

   queryElement()
 })
}

let logObserverDisconnects = true

/**
 * Convenience wrapper for the MutationObserver API:
 *
 * - Defaults to {childList: true}
 * - Observers have associated names
 * - Leading call for callback
 * - Observers are stored in a scope object
 * - Observers already in the given scope will be disconnected
 * - onDisconnect hook for post-disconnect logic
 *
 * @param {Node} $target
 * @param {MutationCallback} callback
 * @param {{
 *   leading?: boolean
 *   logElement?: boolean
 *   name: string
 *   observers: Map<string, import("./types").CustomMutationObserver>
 *   onDisconnect?: () => void
 * }} options
 * @param {MutationObserverInit} mutationObserverOptions
 * @return {import("./types").CustomMutationObserver}
 */
function observeElement($target, callback, options, mutationObserverOptions = {childList: true}) {
  let {leading, logElement, name, observers, onDisconnect} = options

  /** @type {import("./types").CustomMutationObserver} */
  let observer = Object.assign(new MutationObserver(callback), {name})
  let disconnect = observer.disconnect.bind(observer)
  observer.disconnect = () => {
    disconnect()
    observers.delete(name)
    onDisconnect?.()
    if (logObserverDisconnects) {
      log(`disconnected ${name} observer`)
    }
  }

  if (observers.has(name)) {
    log(`disconnecting existing ${name} observer`)
    logObserverDisconnects = false
    observers.get(name).disconnect()
    logObserverDisconnects = true
  }
  observers.set(name, observer)
  if (logElement) {
    log(`observing ${name}`, $target)
  } else {
    log(`observing ${name}`)
  }
  observer.observe($target, mutationObserverOptions)
  if (leading) {
    callback([], observer)
  }
  return observer
}

/**
 * Uses a MutationObserver to wait for a specific element. If found, the
 * observer will be disconnected. If the observer is disconnected first, the
 * resolved value will be null.
 *
 * @param {Node} $target
 * @param {(mutations: MutationRecord[]) => HTMLElement} getter
 * @param {{
 *   logElement?: boolean
 *   name: string
 *   observers: Map<string, import("./types").CustomMutationObserver>
 * }} options
 * @param {MutationObserverInit} [mutationObserverOptions]
 * @return {Promise<HTMLElement>}
 */
function observeForElement($target, getter, options, mutationObserverOptions) {
  return new Promise((resolve) => {
    let found = false
    observeElement($target, (mutations, observer) => {
      let $result = getter(mutations)
      if ($result) {
        found = true
        observer.disconnect()
        resolve($result)
      }
    }, {
      ...options,
      onDisconnect() {
        if (!found) resolve(null)
      },
    }, mutationObserverOptions)
  })
}

/**
 * @param {number} n
 * @returns {string}
 */
function s(n) {
  return n == 1 ? '' : 's'
}
//#endregion

//#region CSS
const configureCss = (() => {
  /** @type {HTMLStyleElement} */
  let $style

  return function configureCss() {
    if (!config.enabled) {
      log('removing stylesheet')
      $style?.remove()
      $style = null
      return
    }

    let cssRules = []
    let hideCssSelectors = []

    if (config.skipAds) {
      // Display a black overlay while ads are playing
      cssRules.push(`
        .ytp-ad-player-overlay {
          background: black;
          z-index: 10;
        }
      `)
      // Hide elements while an ad is showing
      hideCssSelectors.push(
        // Thumbnail for cued ad when autoplay is disabled
        '#movie_player.ad-showing .ytp-cued-thumbnail-overlay-image',
        // Ad title
        '#movie_player.ad-showing .ytp-chrome-top',
        // Ad overlay content
        '#movie_player.ad-showing .ytp-ad-player-overlay > div',
        // Yellow ad progress bar
        '#movie_player.ad-showing .ytp-play-progress',
        // Ad time display
        '#movie_player.ad-showing .ytp-time-display',
      )
    }

    if (config.disableAutoplay) {
      if (desktop) {
        hideCssSelectors.push('button[data-tooltip-target-id="ytp-autonav-toggle-button"]')
      }
      if (mobile) {
        hideCssSelectors.push('button.ytm-autonav-toggle-button-container')
      }
    }

    if (config.disableHomeFeed && loggedIn) {
      if (desktop) {
        hideCssSelectors.push(
          // Prevent flash of content while redirecting
          'ytd-browse[page-subtype="home"]',
          // Hide Home links
          'ytd-guide-entry-renderer:has(> a[href="/"])',
          'ytd-mini-guide-entry-renderer:has(> a[href="/"])',
        )
      }
      if (mobile) {
        hideCssSelectors.push(
          // Prevent flash of content while redirecting
          '.tab-content[tab-identifier="FEwhat_to_watch"]',
          // Bottom nav item
          'ytm-pivot-bar-item-renderer:has(> div.pivot-w2w)',
        )
      }
    }

    if (config.hideHomeCategories) {
      if (desktop) {
        hideCssSelectors.push('ytd-browse[page-subtype="home"] #header')
      }
      if (mobile) {
        hideCssSelectors.push('.tab-content[tab-identifier="FEwhat_to_watch"] .rich-grid-sticky-header')
      }
    }

    // We only hide channels in Home, Search and Related videos
    if (config.hideChannels) {
      let names = []
      let onlyNames = []
      let urls = []
      for (let channel of config.hiddenChannels) {
        names.push(channel.name)
        if (channel.url) {
          urls.push(channel.url)
        } else {
          onlyNames.push(channel.name)
        }
      }

      if (desktop) {
        if (urls.length > 0) {
          let hrefs = urls.map(url => `[href="${url}"]`).join(', ')
          hideCssSelectors.push(
            // Home
            `ytd-browse[page-subtype="home"] ytd-rich-item-renderer:has(#avatar-link:is(${hrefs}))`,
            // Search
            `ytd-search ytd-video-renderer:has(#channel-thumbnail:is(${hrefs}))`,
            `ytd-search ytd-channel-renderer:has(#main-link:is(${hrefs}))`,
          )
        }
        if (names.length > 0) {
          let titles = names.map(url => `[title="${url}"]`).join(', ')
          hideCssSelectors.push(
            // Related videos only have channel names
            `ytd-compact-video-renderer:has(#text.ytd-channel-name:is(${titles}))`,
          )
        }
        // Channels hidden from a Related video will only have the channel name
        if (onlyNames.length > 0) {
          let titles = onlyNames.map(url => `[title="${url}"]`).join(', ')
          hideCssSelectors.push(
            // Home
            `ytd-browse[page-subtype="home"] ytd-rich-item-renderer:has(#text.ytd-channel-name:is(${titles}))`,
            // Search
            `ytd-search ytd-video-renderer:has(#text.ytd-channel-name:is(${titles}))`,
            `ytd-search ytd-channel-renderer:has(#text.ytd-channel-name:is(${titles}))`,
          )
        }

        // Custom elements can't be cloned so we need to style our own menu items
        cssRules.push(`
          .cpfyt-menu-item {
            align-items: center;
            cursor: pointer;
            display: flex;
            min-height: 36px;
            padding: 0 12px 0 16px;
          }
          .cpfyt-menu-item:focus {
            position: relative;
            background-color: var(--paper-item-focused-background-color);
            outline: 0;
          }
          .cpfyt-menu-item:focus::before {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            pointer-events: none;
            background: var(--paper-item-focused-before-background, currentColor);
            border-radius: var(--paper-item-focused-before-border-radius, 0);
            content: var(--paper-item-focused-before-content, "");
            opacity: var(--paper-item-focused-before-opacity, var(--dark-divider-opacity, 0.12));
          }
          .cpfyt-menu-item:hover {
            background-color: var(--yt-spec-10-percent-layer);
          }
          .cpfyt-menu-icon {
            color: var(--yt-spec-text-primary);
            fill: currentColor;
            height: 24px;
            margin-right: 16px;
            width: 24px;
          }
          .cpfyt-menu-text {
            color: var(--yt-spec-text-primary);
            flex-basis: 0.000000001px;
            flex: 1;
            font-family: "Roboto","Arial",sans-serif;
            font-size: 1.4rem;
            font-weight: 400;
            line-height: 2rem;
            margin-right: 24px;
            white-space: nowrap;
          }
        `)
      }
      if (mobile) {
        if (urls.length > 0) {
          let hrefs = urls.map(url => `[href="${url}"]`).join(', ')
          hideCssSelectors.push(
            // Home
            `ytm-rich-item-renderer:has(a:is(${hrefs}))`,
            // Search
            `ytm-search ytm-video-with-context-renderer:has(a:is(${hrefs}))`,
            // Related videos
            `ytm-item-section-renderer[section-identifier="related-items"] ytm-video-with-context-renderer:has(a:is(${hrefs}))`,
          )
        }
      }
    } else {
      // Hide menu item if config is changed after it's added
      hideCssSelectors.push('#cpfyt-hide-channel')
    }

    if (config.hideChat) {
      if (desktop) {
        hideCssSelectors.push('#chat-container')
      }
    }

    if (config.hideComments) {
      if (desktop) {
        hideCssSelectors.push('#comments')
      }
      if (mobile) {
        hideCssSelectors.push('ytm-item-section-renderer[section-identifier="comments-entry-point"]')
      }
    }

    if (config.hideHiddenVideos) {
      // From https://kittygiraudel.com/2021/04/11/css-pie-timer-revisited/
      // The mobile version doesn't have any HTML hooks for appearance mode, so
      // we'll just use the current backgroundColor.
      let bgColor = getComputedStyle(document.documentElement).backgroundColor
      cssRules.push(`
        .cpfyt-pie {
          --cpfyt-pie-background-color: ${bgColor};
          --cpfyt-pie-color: ${bgColor == 'rgb(255, 255, 255)' ? '#065fd4' : '#3ea6ff'};
          --cpfyt-pie-delay: 0ms;
          --cpfyt-pie-direction: normal;
          --cpfyt-pie-duration: ${undoHideDelayMs}ms;
          width: 1em;
          height: 1em;
          font-size: 200%;
          position: relative;
          border-radius: 50%;
          margin: 0.5em;
          display: inline-block;
        }
        .cpfyt-pie::before,
        .cpfyt-pie::after {
          content: "";
          width: 50%;
          height: 100%;
          position: absolute;
          left: 0;
          border-radius: 0.5em 0 0 0.5em;
          transform-origin: center right;
          animation-delay: var(--cpfyt-pie-delay);
          animation-direction: var(--cpfyt-pie-direction);
          animation-duration: var(--cpfyt-pie-duration);
        }
        .cpfyt-pie::before {
          z-index: 1;
          background-color: var(--cpfyt-pie-background-color);
          animation-name: cpfyt-mask;
          animation-timing-function: steps(1);
        }
        .cpfyt-pie::after {
          background-color: var(--cpfyt-pie-color);
          animation-name: cpfyt-rotate;
          animation-timing-function: linear;
        }
        @keyframes cpfyt-rotate {
          to { transform: rotate(1turn); }
        }
        @keyframes cpfyt-mask {
          50%, 100% {
            background-color: var(--cpfyt-pie-color);
            transform: rotate(0.5turn);
          }
        }
      `)
      hideCssSelectors.push('.cpfyt-hidden-video')
    }

    if (config.hideLive) {
      if (desktop) {
        hideCssSelectors.push(
          // Grid item (Home, Subscriptions)
          'ytd-browse:not([page-subtype="channels"]) ytd-rich-item-renderer:has(ytd-thumbnail[is-live-video])',
          // List item (Search)
          'ytd-video-renderer:has(ytd-thumbnail[is-live-video])',
          // Related video
          'ytd-compact-video-renderer:has(> .ytd-compact-video-renderer > ytd-thumbnail[is-live-video])',
        )
      }
      if (mobile) {
        hideCssSelectors.push(
          // Home
          'ytm-rich-item-renderer:has(ytm-thumbnail-overlay-time-status-renderer[data-style="LIVE"])',
          // Subscriptions
          '.tab-content[tab-identifier="FEsubscriptions"] ytm-item-section-renderer:has(ytm-thumbnail-overlay-time-status-renderer[data-style="LIVE"])',
          // Search
          'ytm-search ytm-video-with-context-renderer:has(ytm-thumbnail-overlay-time-status-renderer[data-style="LIVE"])',
          // Related videos
          'ytm-item-section-renderer[section-identifier="related-items"] ytm-video-with-context-renderer:has(ytm-thumbnail-overlay-time-status-renderer[data-style="LIVE"])',
        )
      }
    }

    if (config.hideMetadata) {
      if (desktop) {
        hideCssSelectors.push(
          // Channel name / Videos / About
          '#structured-description .ytd-structured-description-content-renderer',
          // Game name and Gaming link
          '#above-the-fold + ytd-metadata-row-container-renderer',
        )
      }
      if (mobile) {
        hideCssSelectors.push(
          // Game name and Gaming link
          'ytm-structured-description-content-renderer yt-video-attributes-section-view-model',
          'ytm-video-description-gaming-section-renderer',
          // Channel name / Videos / About
          'ytm-structured-description-content-renderer ytm-video-description-infocards-section-renderer',
        )
      }
    }

    if (config.hideMixes) {
      if (desktop) {
        hideCssSelectors.push(
          // Chip in Home
          `yt-chip-cloud-chip-renderer:has(> yt-formatted-string[title="${getString('MIXES')}"])`,
          // Grid item
          'ytd-rich-item-renderer:has(a#thumbnail[href$="start_radio=1"])',
          // List item
          'ytd-radio-renderer',
          // Related video
          'ytd-compact-radio-renderer',
        )
      }
      if (mobile) {
        hideCssSelectors.push(
          // Chip in Home
          `ytm-chip-cloud-chip-renderer:has(> .chip-container[aria-label="${getString('MIXES')}"])`,
          // Home
          'ytm-rich-item-renderer:has(> ytm-radio-renderer)',
          // Search result
          'ytm-compact-radio-renderer',
        )
      }
    }

    if (config.hideNextButton) {
      if (desktop) {
        // Hide the Next by default so it doesn't flash in and out of visibility
        // Show Next is Previous is enabled (e.g. when viewing a playlist video)
        cssRules.push(`
          .ytp-chrome-controls .ytp-next-button {
            display: none !important;
          }
          .ytp-chrome-controls .ytp-prev-button[aria-disabled="false"] ~ .ytp-next-button {
            display: revert !important;
          }
        `)
      }
      if (mobile) {
        // Hide Previous and Next buttons when the Previous button isn't enabled
        cssRules.push(`
          .player-controls-middle-core-buttons > button[aria-label="${getString('PREVIOUS_VIDEO')}"],
          .player-controls-middle-core-buttons > button[aria-label="${getString('NEXT_VIDEO')}"] {
            display: none;
          }
          .player-controls-middle-core-buttons > button[aria-label="${getString('PREVIOUS_VIDEO')}"][aria-disabled="false"],
          .player-controls-middle-core-buttons > button[aria-label="${getString('PREVIOUS_VIDEO')}"][aria-disabled="false"] ~ button[aria-label="${getString('NEXT_VIDEO')}"] {
            display: revert;
          }
        `)
      }
    }

    if (config.hideRelated) {
      if (desktop) {
        hideCssSelectors.push('#related')
      }
      if (mobile) {
        hideCssSelectors.push('ytm-item-section-renderer[section-identifier="related-items"]')
      }
    }

    if (config.hideShorts) {
      if (desktop) {
        hideCssSelectors.push(
          // Side nav item
          `ytd-guide-entry-renderer:has(> a[title="${getString('SHORTS')}"])`,
          // Mini side nav item
          `ytd-mini-guide-entry-renderer[aria-label="${getString('SHORTS')}"]`,
          // Grid shelf
          'ytd-rich-section-renderer:has(> #content > ytd-rich-shelf-renderer[is-shorts])',
          // Chips
          `yt-chip-cloud-chip-renderer:has(> yt-formatted-string[title="${getString('SHORTS')}"])`,
          // List shelf (except History, so watched Shorts can be removed)
          'ytd-browse:not([page-subtype="history"]) ytd-reel-shelf-renderer',
          'ytd-search ytd-reel-shelf-renderer',
          // List item (except History, so watched Shorts can be removed)
          'ytd-browse:not([page-subtype="history"]) ytd-video-renderer:has(a[href^="/shorts"])',
          'ytd-search ytd-video-renderer:has(a[href^="/shorts"])',
          // Under video
          '#structured-description ytd-reel-shelf-renderer',
          // In related
          '#related ytd-reel-shelf-renderer',
        )
      }
      if (mobile) {
        hideCssSelectors.push(
          // Bottom nav item
          'ytm-pivot-bar-item-renderer:has(> div.pivot-shorts)',
          // Home shelf
          'ytm-rich-section-renderer:has(ytm-reel-shelf-renderer)',
          // Subscriptions shelf
          '.tab-content[tab-identifier="FEsubscriptions"] ytm-item-section-renderer:has(ytm-reel-shelf-renderer)',
          // Search shelf
          'ytm-search lazy-list > ytm-reel-shelf-renderer',
          // Search
          'ytm-search ytm-video-with-context-renderer:has(a[href^="/shorts"])',
          // Under video
          'ytm-structured-description-content-renderer ytm-reel-shelf-renderer',
        )
      }
    }

    if (config.hideSponsored) {
      if (desktop) {
        hideCssSelectors.push(
          // Big ads and promos on Home screen
          '#masthead-ad',
          '#big-yoodle ytd-statement-banner-renderer',
          'ytd-rich-section-renderer:has(> #content > ytd-statement-banner-renderer)',
          'ytd-rich-section-renderer:has(> #content > ytd-rich-shelf-renderer[has-paygated-featured-badge])',
          'ytd-rich-section-renderer:has(> #content > ytd-brand-video-shelf-renderer)',
          'ytd-rich-section-renderer:has(> #content > ytd-brand-video-singleton-renderer)',
          'ytd-rich-section-renderer:has(> #content > ytd-inline-survey-renderer)',
          // Bottom of screen promo
          'tp-yt-paper-dialog:has(> #mealbar-promo-renderer)',
          // Video listings
          'ytd-rich-item-renderer:has(> .ytd-rich-item-renderer > ytd-ad-slot-renderer)',
          // Search results
          '#contents.style-scope.ytd-search-pyv-renderer',
          'ytd-ad-slot-renderer.style-scope.ytd-item-section-renderer',
          // When an ad is playing
          'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-ads"]',
          // Suggestd action buttons in player overlay
          '#movie_player .ytp-suggested-action',
          // Panels linked to those buttons
          '#below #panels',
          // After an ad
          '.ytp-ad-action-interstitial',
          // Above Related videos
          '#player-ads',
          // In Related videos
          '#items > ytd-ad-slot-renderer',
        )
      }
      if (mobile) {
        hideCssSelectors.push(
          // Big promo on Home screen
          'ytm-statement-banner-renderer',
          // Bottom of screen promo
          '.mealbar-promo-renderer',
          // Search results
          'ytm-item-section-renderer:has(> lazy-list > ad-slot-renderer)',
          // When an ad is playing
          '.video-ads .ytp-video-ad-top-bar-title',
          '.ytp-ad-player-overlay-flyout-cta',
          '.ytp-ad-visit-advertiser-button',
          // Directly under video
          'ytm-companion-slot:has(> ytm-companion-ad-renderer)',
        )
      }
    }

    if (config.hideStreamed) {
      if (desktop) {
        hideCssSelectors.push(
          // Grid item (Home, Subscriptions)
          `ytd-browse:not([page-subtype="channels"]) ytd-rich-item-renderer:has(#video-title-link[aria-label*="${getString('STREAMED_TITLE')}"])`,
          // List item (Search)
          `ytd-video-renderer:has(#video-title[aria-label*="${getString('STREAMED_TITLE')}"])`,
          // Related video
          `ytd-compact-video-renderer:has(#video-title[aria-label*="${getString('STREAMED_TITLE')}"])`,
        )
      }
      if (mobile) {
        hideCssSelectors.push(
          // Home
          `ytm-rich-item-renderer:has(.yt-core-attributed-string[aria-label*="${getString('STREAMED_TITLE')}"])`,
          // Subscriptions
          `.tab-content[tab-identifier="FEsubscriptions"] ytm-item-section-renderer:has(.yt-core-attributed-string[aria-label*="${getString('STREAMED_TITLE')}"])`,
          // Search result
          `ytm-search ytm-video-with-context-renderer:has(.yt-core-attributed-string[aria-label*="${getString('STREAMED_TITLE')}"])`,
          // Related videos
          `ytm-item-section-renderer[section-identifier="related-items"] ytm-video-with-context-renderer:has(.yt-core-attributed-string[aria-label*="${getString('STREAMED_TITLE')}"])`,
        )
      }
    }

    if (config.hideUpcoming) {
      if (desktop) {
        hideCssSelectors.push(
          // Grid item
          'ytd-browse:not([page-subtype="channels"]) ytd-rich-item-renderer:has(ytd-thumbnail-overlay-time-status-renderer[overlay-style="UPCOMING"])',
          // List item
          'ytd-video-renderer:has(ytd-thumbnail-overlay-time-status-renderer[overlay-style="UPCOMING"])',
        )
      }
      if (mobile) {
        hideCssSelectors.push(
          // Subscriptions
          '.tab-content[tab-identifier="FEsubscriptions"] ytm-item-section-renderer:has(ytm-thumbnail-overlay-time-status-renderer[data-style="UPCOMING"])'
        )
      }
    }

    if (config.hideVoiceSearch) {
      if (desktop) {
        hideCssSelectors.push('#voice-search-button')
      }
      if (mobile) {
        hideCssSelectors.push('.searchbox-voice-search-wrapper')
      }
    }

    if (config.hideWatched) {
      let percentSelector = ''
      if (config.hideWatchedThreshold != 'any') {
        let start = Number(config.hideWatchedThreshold)
        percentSelector = `:is(${Array.from({length: 100 - start + 1}, (_, i) => `[style*="${i + start}%"]`).join(', ')})`
      }
      if (desktop) {
        hideCssSelectors.push(
          // Grid item (except channel profile)
          `ytd-browse:not([page-subtype="channels"]) ytd-rich-item-renderer:has(#progress${percentSelector})`,
          // List item (except History, so watched videos can be removed)
          `ytd-browse:not([page-subtype="history"]) ytd-video-renderer:has(#progress${percentSelector})`,
          `ytd-search ytd-video-renderer:has(#progress${percentSelector})`,
          // Related video
          `ytd-compact-video-renderer:has(#progress${percentSelector})`,
        )
      }
      if (mobile) {
        hideCssSelectors.push(
          // Home
          `ytm-rich-item-renderer:has(.thumbnail-overlay-resume-playback-progress${percentSelector})`,
          // Subscriptions
          `.tab-content[tab-identifier="FEsubscriptions"] ytm-item-section-renderer:has(.thumbnail-overlay-resume-playback-progress${percentSelector})`,
          // Search
          `ytm-search ytm-video-with-context-renderer:has(.thumbnail-overlay-resume-playback-progress${percentSelector})`,
          // Related videos
          `ytm-item-section-renderer[section-identifier="related-items"] ytm-video-with-context-renderer:has(.thumbnail-overlay-resume-playback-progress${percentSelector})`,
        )
      }
    }

    //#region Desktop-only
    if (desktop) {
      if (config.fillGaps) {
        cssRules.push(`
          ytd-browse:is([page-subtype="home"], [page-subtype="subscriptions"]) ytd-rich-grid-row,
          ytd-browse:is([page-subtype="home"], [page-subtype="subscriptions"]) ytd-rich-grid-row > #contents {
            display: contents !important;
          }
          ytd-browse:is([page-subtype="home"], [page-subtype="subscriptions"]) ytd-rich-grid-renderer > #contents {
            width: auto !important;
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
          ytd-browse[page-subtype="subscriptions"] ytd-rich-grid-renderer > #contents > ytd-rich-section-renderer:first-child > #content {
            margin-left: 8px !important;
            margin-right: 8px !important;
          }
        `)
      }
      if (config.hideEndCards) {
        hideCssSelectors.push('#movie_player .ytp-ce-element')
      }
      if (config.hideEndVideos) {
        hideCssSelectors.push('#movie_player .ytp-endscreen-content')
      }
      if (config.hideMerchEtc) {
        hideCssSelectors.push(
          // Tickets
          '#ticket-shelf',
          // Merch
          'ytd-merch-shelf-renderer',
          // Offers
          '#offer-module',
        )
      }
      if (config.hideSubscriptionsLatestBar) {
        hideCssSelectors.push('ytd-browse[page-subtype="subscriptions"] ytd-rich-grid-renderer > #contents > ytd-rich-section-renderer:first-child')
      }
      if (config.hideSuggestedSections) {
        let homeShelfTitles = [
          getString('BREAKING_NEWS'),
          getString('RECOMMENDED'),
        ].map(title => `[data-cpfyt-title="${title}"]`).join(', ')
        let searchShelfTitles = [
          getString('CHANNELS_NEW_TO_YOU'),
          getString('FOR_YOU'),
          getString('FROM_RELATED_SEARCHES'),
          getString('PEOPLE_ALSO_WATCHED'),
          getString('POPULAR_TODAY'),
          getString('PREVIOUSLY_WATCHED'),
        ].map(title => `[data-cpfyt-title="${title}"]`).join(', ')
        hideCssSelectors.push(
          // Trending shelf in Home
          'ytd-rich-section-renderer:has(a[href="/feed/trending"])',
          // Shelves with specific titles in Home
          `ytd-rich-section-renderer:is(${homeShelfTitles})`,
          // Looking for something different? tile in Home
          'ytd-rich-item-renderer:has(> #content > ytd-feed-nudge-renderer)',
          // List shelves with specific titles in Search
          `ytd-shelf-renderer:is(${searchShelfTitles})`,
          // People also search for in Search
          '#contents.ytd-item-section-renderer > ytd-horizontal-card-list-renderer',
        )
      }
      if (config.tidyGuideSidebar) {
        hideCssSelectors.push(
          // Logged in
          // Subscriptions (2nd of 5)
          '#sections.ytd-guide-renderer > ytd-guide-section-renderer:nth-child(2):nth-last-child(4)',
          // Explore (3rd of 5)
          '#sections.ytd-guide-renderer > ytd-guide-section-renderer:nth-child(3):nth-last-child(3)',
          // More from YouTube (4th of 5)
          '#sections.ytd-guide-renderer > ytd-guide-section-renderer:nth-child(4):nth-last-child(2)',
          // Logged out
          /*
          // Subscriptions - prompts you to log in
          '#sections.ytd-guide-renderer > ytd-guide-section-renderer:nth-child(1):nth-last-child(7) > #items > ytd-guide-entry-renderer:has(> a[href="/feed/subscriptions"])',
          // You (2nd of 7) - prompts you to log in
          '#sections.ytd-guide-renderer > ytd-guide-section-renderer:nth-child(2):nth-last-child(6)',
          // Sign in prompt - already have one in the top corner
          '#sections.ytd-guide-renderer > ytd-guide-signin-promo-renderer',
          */
          // Explore (4th of 7)
          '#sections.ytd-guide-renderer > ytd-guide-section-renderer:nth-child(4):nth-last-child(4)',
          // Browse Channels (5th of 7)
          '#sections.ytd-guide-renderer > ytd-guide-section-renderer:nth-child(5):nth-last-child(3)',
          // More from YouTube (6th of 7)
          '#sections.ytd-guide-renderer > ytd-guide-section-renderer:nth-child(6):nth-last-child(2)',
          // Footer
          '#footer.ytd-guide-renderer',
        )
      }
    }
    //#endregion

    //#region Mobile-only
    if (mobile) {
      if (config.hideExploreButton) {
        // Explore button on Home screen
        hideCssSelectors.push('ytm-chip-cloud-chip-renderer[chip-style="STYLE_EXPLORE_LAUNCHER_CHIP"]')
      }
      if (config.hideOpenApp) {
        hideCssSelectors.push(
          // The user menu is replaced with "Open App" on videos when logged out
          'html.watch-scroll .mobile-topbar-header-sign-in-button',
          // The overflow menu has an Open App menu item we'll add this class to
          'ytm-menu-item.open-app-menu-item',
          // The last item in the full screen menu is Open App
          '#menu .multi-page-menu-system-link-list:has(+ ytm-privacy-tos-footer-renderer)',
        )
      }
      if (config.hideSubscriptionsChannelList) {
        // Channel list at top of Subscriptions
        hideCssSelectors.push('.tab-content[tab-identifier="FEsubscriptions"] ytm-channel-list-sub-menu-renderer')
      }
      if (config.subscriptionsGridView) {
        // Based on the Home grid layout
        cssRules.push(`
          @media (min-width: 550px) and (orientation: portrait) {
            ytm-section-list-renderer {
              margin: 0 16px;
            }
            ytm-section-list-renderer > lazy-list {
              margin: 16px -8px 0 -8px;
            }
            ytm-item-section-renderer {
              width: calc(50% - 16px);
              display: inline-block !important;
              vertical-align: top;
              border-bottom: none !important;
              margin-bottom: 16px;
              margin-left: 8px;
              margin-right: 8px;
            }
            lazy-list ytm-media-item {
              margin-top: 0 !important;
              padding: 0 !important;
            }
            /* Fix shorts if they're not being hidden */
            ytm-item-section-renderer:has(ytm-reel-shelf-renderer) {
              width: calc(100% - 16px);
              display: block;
            }
            ytm-item-section-renderer:has(ytm-reel-shelf-renderer) > lazy-list {
              margin-left: -16px;
              margin-right: -16px;
            }
            /* Fix the channel list bar if it's not being hidden */
            ytm-channel-list-sub-menu-renderer {
              margin-left: -16px;
              margin-right: -16px;
            }
          }
          @media (min-width: 874px) and (orientation: portrait) {
            ytm-item-section-renderer {
              width: calc(33.3% - 16px);
            }
          }
          /* The page will probably switch to the list view before it ever hits this */
          @media (min-width: 1160px) and (orientation: portrait) {
            ytm-item-section-renderer {
              width: calc(25% - 16px);
            }
          }
        `)
      }
    }
    //#endregion

    if (hideCssSelectors.length > 0) {
      cssRules.push(`
        ${hideCssSelectors.join(',\n')} {
          display: none !important;
        }
      `)
    }

    let css = cssRules.map(dedent).join('\n')
    if ($style == null) {
      $style = addStyle(css)
    } else {
      $style.textContent = css
    }
  }
})()
//#endregion

function isHomePage() {
  return location.pathname == '/'
}

function isSearchPage() {
  return location.pathname == '/results'
}

function isSubscriptionsPage() {
  return location.pathname == '/feed/subscriptions'
}

function isVideoPage() {
  return location.pathname == '/watch'
}

//#region Tweak functions
async function disableAutoplay() {
  if (desktop) {
    let $autoplayButton = await getElement('button[data-tooltip-target-id="ytp-autonav-toggle-button"]', {
      name: 'Autoplay button',
      stopIf: currentUrlChanges(),
    })
    if (!$autoplayButton) return

    // On desktop, initial Autoplay button HTML has style="display: none" and is
    // always checked on. Once it's displayed, we can determine its real state
    // and take action if needed.
    observeElement($autoplayButton, (_, observer) => {
      if ($autoplayButton.style.display == 'none') return
      if ($autoplayButton.querySelector('.ytp-autonav-toggle-button[aria-checked="true"]')) {
        log('turning Autoplay off')
        $autoplayButton.click()
      } else {
        log('Autoplay is already off')
      }
      observer.disconnect()
    }, {
      leading: true,
      name: 'Autoplay button style (for button being displayed)',
      observers: pageObservers,
    }, {
      attributes: true,
      attributeFilter: ['style'],
    })
  }

  if (mobile) {
    // Appearance of the Autoplay button may be delayed until interaction
    let $customControl = await getElement('#player-control-container > ytm-custom-control', {
      name: 'Autoplay <ytm-custom-control>',
      stopIf: currentUrlChanges(),
    })
    if (!$customControl) return

    observeElement($customControl, (_, observer) => {
      if ($customControl.childElementCount == 0) return

      let $autoplayButton = /** @type {HTMLElement} */ ($customControl.querySelector('button.ytm-autonav-toggle-button-container'))
      if (!$autoplayButton) return

      if ($autoplayButton.getAttribute('aria-pressed') == 'true') {
        log('turning Autoplay off')
        $autoplayButton.click()
      } else {
        log('Autoplay is already off')
      }
      observer.disconnect()
    }, {
      leading: true,
      name: 'Autoplay <ytm-custom-control> (for Autoplay button being added)',
      observers: pageObservers,
    })
  }
}

function downloadTranscript() {
  // TODO Check if the transcript is still loading
  let $segments = document.querySelector('.ytd-transcript-search-panel-renderer #segments-container')
  let sections = []
  let parts = []

  for (let $el of $segments.children) {
    if ($el.tagName == 'YTD-TRANSCRIPT-SECTION-HEADER-RENDERER') {
      if (parts.length > 0) {
        sections.push(parts.join(' '))
        parts = []
      }
      sections.push(/** @type {HTMLElement} */ ($el.querySelector('#title')).innerText.trim())
    } else {
      parts.push(/** @type {HTMLElement} */ ($el.querySelector('.segment-text')).innerText.trim())
    }
  }
  if (parts.length > 0) {
    sections.push(parts.join(' '))
  }

  let $link = document.createElement('a')
  log('transcript', sections.join('\n\n'))
  let url = URL.createObjectURL(new Blob([sections.join('\n\n')], {type: "text/plain"}))
  let title = /** @type {HTMLElement} */ (document.querySelector('#above-the-fold #title'))?.innerText ?? 'transcript'
  $link.setAttribute('href', url)
  $link.setAttribute('download', `${title}.txt`)
  $link.click()
  URL.revokeObjectURL(url)
}

async function observePopups() {
  if (desktop) {
    // Desktop dialogs and menus appear in <ytd-popup-container>. Once created,
    // the same elements are reused.
    let $popupContainer = await getElement('ytd-popup-container', {name: 'popup container'})
    let $dropdown = /** @type {HTMLElement} */ ($popupContainer.querySelector('tp-yt-iron-dropdown'))
    let $dialog = /** @type {HTMLElement} */ ($popupContainer.querySelector('tp-yt-paper-dialog'))

    function observeDialog() {
      observeElement($dialog, () => {
        if ($dialog.getAttribute('aria-hidden') == 'true') {
          log('dialog closed')
          if (onDialogClosed) {
            onDialogClosed()
            onDialogClosed = null
          }
        }
      }, {
        name: '<tp-yt-paper-dialog> (for [aria-hidden] being added)',
        observers: globalObservers,
      }, {
        attributes: true,
        attributeFilter: ['aria-hidden'],
      })
    }

    function observeDropdown() {
      observeElement($dropdown, () => {
        if ($dropdown.getAttribute('aria-hidden') != 'true') {
          onDesktopMenuAppeared($dropdown)
        }
      }, {
        leading: true,
        name: '<tp-yt-iron-dropdown> (for [aria-hidden] being removed)',
        observers: globalObservers,
      }, {
        attributes: true,
        attributeFilter: ['aria-hidden'],
      })
    }

    if ($dialog) observeDialog()
    if ($dropdown) observeDropdown()

    if (!$dropdown || !$dialog) {
      observeElement($popupContainer, (mutations, observer) => {
        for (let mutation of mutations) {
          for (let $el of mutation.addedNodes) {
            switch($el.nodeName) {
              case 'TP-YT-IRON-DROPDOWN':
                $dropdown = /** @type {HTMLElement} */ ($el)
                observeDropdown()
                break
              case 'TP-YT-PAPER-DIALOG':
                $dialog = /** @type {HTMLElement} */ ($el)
                observeDialog()
                break
            }
            if ($dropdown && $dialog) {
              observer.disconnect()
            }
          }
        }
      }, {
        name: '<ytd-popup-container> (for initial <tp-yt-iron-dropdown> and <tp-yt-paper-dialog> being added)',
        observers: globalObservers,
      })
    }
  }

  if (mobile) {
    // Depending on resolution, mobile menus appear in <bottom-sheet-container>
    // (lower res) or as a #menu child of <body> (higher res).
    let $body = await getElement('body', {name: '<body>'})
    if (!$body) return

    let $menu = /** @type {HTMLElement} */ (document.querySelector('body > #menu'))
    if ($menu) {
      onMobileMenuAppeared($menu)
    }

    observeElement($body, (mutations) => {
      for (let mutation of mutations) {
        for (let $el of mutation.addedNodes) {
          if ($el instanceof HTMLElement && $el.id == 'menu') {
            onMobileMenuAppeared($el)
            return
          }
        }
      }
    }, {
      name: '<body> (for #menu being added)',
      observers: globalObservers,
    })

    // When switching between screens, <bottom-sheet-container> is replaced
    let $app = await getElement('ytm-app', {name: '<ytm-app>'})
    if (!$app) return

    let $bottomSheet = /** @type {HTMLElement} */ ($app.querySelector('bottom-sheet-container'))

    function observeBottomSheet() {
      observeElement($bottomSheet, () => {
        if ($bottomSheet.childElementCount > 0) {
          onMobileMenuAppeared($bottomSheet)
        }
      }, {
        leading: true,
        name: '<bottom-sheet-container> (for content being added)',
        observers: globalObservers,
      })
    }

    if ($bottomSheet) observeBottomSheet()

    observeElement($app, (mutations) => {
      for (let mutation of mutations) {
        for (let $el of mutation.addedNodes) {
          if ($el.nodeName == 'BOTTOM-SHEET-CONTAINER') {
            log('new bottom sheet appeared')
            $bottomSheet = /** @type {HTMLElement} */ ($el)
            observeBottomSheet()
            return
          }
        }
      }
    }, {
      name: '<ytm-app> (for <bottom-sheet-container> being replaced)',
      observers: globalObservers,
    })
  }
}

/**
 * Detect navigation between pages for features which apply to specific pages.
 */
async function observeTitle() {
  let $title = await getElement('title', {name: '<title>'})
  let seenUrl
  observeElement($title, () => {
    let currentUrl = getCurrentUrl()
    if (seenUrl != null && seenUrl == currentUrl) {
      return
    }
    seenUrl = currentUrl
    handleCurrentUrl()
  }, {
    leading: true,
    name: '<title> (for title changes)',
    observers: globalObservers,
  })
}

function handleCurrentUrl() {
  log('handling', getCurrentUrl())
  disconnectObservers(pageObservers, 'page')

  if (isHomePage()) {
    tweakHomePage()
  }
  else if (isVideoPage()) {
    tweakVideoPage()
  }
  else if (isSearchPage()) {
    tweakSearchPage()
  }
  else if (location.pathname.startsWith('/shorts/')) {
    if (config.redirectShorts) {
      redirectShort()
    }
  }
}

function addDownloadTranscriptToDesktopMenu($menu) {
  if (!isVideoPage()) return

  let $transcript = $lastClickedElement.closest('[target-id="engagement-panel-searchable-transcript"]')
  if (!$transcript) return

  if ($menu.querySelector('.cpfyt-menu-item')) return

  let $menuItems = $menu.querySelector('#items')
  $menuItems.insertAdjacentHTML('beforeend', `
    <div class="cpfyt-menu-item" tabindex="0">
      <div class="cpfyt-menu-text">
        ${getString('DOWNLOAD')}
      </div>
    </div>
  `.trim())
  let $item = $menuItems.lastElementChild
  function download() {
    downloadTranscript()
    // Dismiss the menu
    // @ts-ignore
    document.querySelector('#content')?.click()
  }
  $item.addEventListener('click', download)
  $item.addEventListener('keydown', (e) => {
    if (e.key == ' ' || e.key == 'Enter') {
      e.preventDefault()
      download()
    }
  })
}

/** @param {HTMLElement} $menu */
function addHideChannelToDesktopMenu($menu) {
  /** @type {import("./types").Channel} */
  let channel
  if (isSearchPage()) {
    let $video = $lastClickedElement.closest('ytd-video-renderer')
    if ($video) {
      let $link = /** @type {HTMLAnchorElement} */ ($video.querySelector('#text.ytd-channel-name a'))
      if ($link) {
        channel = {
          name: $link.textContent,
          url: $link.pathname,
        }
      } else {
        warn('unable to find channel name link in <ytd-video-renderer>')
      }
    }
  }
  else if (isVideoPage()) {
    let $video= $lastClickedElement.closest('ytd-compact-video-renderer')
    if ($video) {
      // Only the channel name is available in a relate video on desktop
      let $link = /** @type {HTMLElement} */ ($video.querySelector('#text.ytd-channel-name'))
      if ($link) {
        channel = {
          name: $link.getAttribute('title')
        }
      } else {
        warn('unable to find channel name link in <ytd-compact-video-renderer>')
      }
    }
  }
  else if (isHomePage()) {
    let $video = $lastClickedElement.closest('ytd-rich-item-renderer')
    let $link = /** @type {HTMLAnchorElement} */ ($video.querySelector('#text.ytd-channel-name a'))
    if ($link) {
      channel = {
        name: $link.textContent,
        url: $link.pathname,
      }
    } else {
      warn('unable to find channel name link in <ytd-rich-item-renderer>')
    }
  }

  if (!channel) return
  lastClickedChannel = channel

  if ($menu.querySelector('.cpfyt-menu-item')) return

  let $menuItems = $menu.querySelector('#items')
  $menuItems.insertAdjacentHTML('beforeend', `
    <div class="cpfyt-menu-item" tabindex="0" id="cpfyt-hide-channel">
      <div class="cpfyt-menu-icon">
        ${Svgs.DELETE}
      </div>
      <div class="cpfyt-menu-text">
        ${getString('HIDE_CHANNEL')}
      </div>
    </div>
  `.trim())
  let $item = $menuItems.lastElementChild
  function hideChannel() {
    config.hiddenChannels.unshift(lastClickedChannel)
    storeConfigChanges({hiddenChannels: config.hiddenChannels})
    configureCss()
    // Dismiss the menu
    let $popupContainer = /** @type {HTMLElement} */ ($menu.closest('ytd-popup-container'))
    $popupContainer.click()
    // XXX Menu isn't dismissing on iPad Safari
    if ($menu.style.display != 'none') {
      $menu.style.display = 'none'
      $menu.setAttribute('aria-hidden', 'true')
    }
  }
  $item.addEventListener('click', hideChannel)
  $item.addEventListener('keydown', /** @param {KeyboardEvent} e */ (e) => {
    if (e.key == ' ' || e.key == 'Enter') {
      e.preventDefault()
      hideChannel()
    }
  })
}

/**
 * @param {HTMLElement} $menu
 */
async function addHideChannelToMobileMenu($menu) {
  /** @type {import("./types").Channel} */
  let channel
  if (isHomePage() || isSearchPage() || isVideoPage()) {
    let $video = $lastClickedElement.closest('ytm-video-with-context-renderer')
    if ($video) {
      let $thumbnailLink =/** @type {HTMLAnchorElement} */ ($video.querySelector('ytm-channel-thumbnail-with-link-renderer > a'))
      let $name = /** @type {HTMLElement} */ ($video.querySelector('ytm-badge-and-byline-renderer .yt-core-attributed-string'))
      if ($name) {
        channel = {
          name: $name.textContent,
          url: $thumbnailLink?.pathname,
        }
      } else {
        warn('unable to find channel name in <ytm-video-with-context-renderer>')
      }
    }
  }

  if (!channel) return
  lastClickedChannel = channel

  let $menuItems = $menu.querySelector($menu.id == 'menu' ? '.menu-content' : '.bottom-sheet-media-menu-item')
  // TOOO Figure out what we have to wait for to add menu items ASAP without them getting removed
  await new Promise((resolve) => setTimeout(resolve, 50))
  let hasIcon = Boolean($menuItems.querySelector('c3-icon'))
  $menuItems.insertAdjacentHTML('beforeend', `
    <ytm-menu-item id="cpfyt-hide-channel">
      <button class="menu-item-button">
        ${hasIcon ? `<c3-icon>
          <div style="width: 100%; height: 100%; fill: currentcolor;">
            ${Svgs.DELETE}
          </div>
        </c3-icon>` : ''}
        <span class="yt-core-attributed-string" role="text">
          ${getString('HIDE_CHANNEL')}
        </span>
      </button>
    </ytm-menu-item>
  `.trim())
  let $button = $menuItems.lastElementChild.querySelector('button')
  $button.addEventListener('click', () => {
    config.hiddenChannels.unshift(lastClickedChannel)
    storeConfigChanges({hiddenChannels: config.hiddenChannels})
    configureCss()
    // Dismiss the menu
    let $overlay = $menu.id == 'menu' ? $menu.querySelector('c3-overlay') : document.querySelector('.bottom-sheet-overlay')
    // @ts-ignore
    $overlay?.click()
  })
}

function observeVideoHiddenState() {
  if (!isHomePage() && !isSubscriptionsPage()) return

  if (desktop) {
    let $video = $lastClickedElement?.closest('ytd-rich-grid-media')
    if (!$video) return

    observeElement($video, (_, observer) => {
      if (!$video.hasAttribute('is-dismissed')) return

      observer.disconnect()

      log('video hidden, showing timer')
      let $actions = $video.querySelector('ytd-notification-multi-action-renderer')
      let $undoButton = $actions.querySelector('button')
      let $tellUsWhyButton = $actions.querySelector(`button[aria-label="${getString('TELL_US_WHY')}"]`)
      let $pie
      let timeout
      let startTime

      function displayPie(options = {}) {
        let {delay, direction, duration} = options
        $pie?.remove()
        $pie = document.createElement('div')
        $pie.classList.add('cpfyt-pie')
        if (delay) $pie.style.setProperty('--cpfyt-pie-delay', `${delay}ms`)
        if (direction) $pie.style.setProperty('--cpfyt-pie-direction', direction)
        if (duration) $pie.style.setProperty('--cpfyt-pie-duration', `${duration}ms`)
        $actions.appendChild($pie)
      }

      function startTimer() {
        startTime = Date.now()
        timeout = setTimeout(() => {
          let $elementToHide = $video.closest('ytd-rich-item-renderer')
          $elementToHide?.classList.add('cpfyt-hidden-video')
          cleanup()
          // Remove the class if the Undo button is clicked later, e.g. if
          // this feature is disabled after hiding a video.
          $undoButton.addEventListener('click', () => {
            $elementToHide?.classList.remove('cpfyt-hidden-video')
          })
        }, undoHideDelayMs)
      }

      function cleanup() {
        $undoButton.removeEventListener('click', onUndoClick)
        if ($tellUsWhyButton) {
          $tellUsWhyButton.removeEventListener('click', onTellUsWhyClick)
        }
        $pie.remove()
      }

      function onUndoClick() {
        clearTimeout(timeout)
        cleanup()
      }

      function onTellUsWhyClick() {
        let elapsedTime = Date.now() - startTime
        clearTimeout(timeout)
        displayPie({
          direction: 'reverse',
          delay: Math.round((elapsedTime - undoHideDelayMs) / 4),
          duration: undoHideDelayMs / 4,
        })
        onDialogClosed = () => {
          startTimer()
          displayPie()
        }
      }

      $undoButton.addEventListener('click', onUndoClick)
      if ($tellUsWhyButton) {
        $tellUsWhyButton.addEventListener('click', onTellUsWhyClick)
      }
      startTimer()
      displayPie()
    }, {
      name: '<ytd-rich-grid-media> (for [is-dismissed] being added)',
      observers: pageObservers,
    }, {
      attributes: true,
      attributeFilter: ['is-dismissed'],
    })
  }

  if (mobile) {
    /** @type {HTMLElement} */
    let $container
    if (isHomePage()) {
      $container = $lastClickedElement?.closest('ytm-rich-item-renderer')
    }
    else if (isSubscriptionsPage()) {
      $container = $lastClickedElement?.closest('lazy-list')
    }
    if (!$container) return

    observeElement($container, (mutations, observer) => {
      for (let mutation of mutations) {
        for (let $el of mutation.addedNodes) {
          if ($el.nodeName != 'YTM-NOTIFICATION-MULTI-ACTION-RENDERER') continue

          observer.disconnect()

          log('video hidden, showing timer')
          let $actions = /** @type {HTMLElement} */ ($el).firstElementChild
          let $undoButton = /** @type {HTMLElement} */ ($el).querySelector('button')
          function cleanup() {
            $undoButton.removeEventListener('click', undoClicked)
            $actions.querySelector('.cpfyt-pie')?.remove()
          }
          let hideHiddenVideoTimeout = setTimeout(() => {
            let $elementToHide = $container
            if (isSubscriptionsPage()) {
              $elementToHide = $container.closest('ytm-item-section-renderer')
            }
            $elementToHide?.classList.add('cpfyt-hidden-video')
            cleanup()
            // Remove the class if the Undo button is clicked later, e.g. if
            // this feature is disabled after hiding a video.
            $undoButton.addEventListener('click', () => {
              $elementToHide?.classList.remove('cpfyt-hidden-video')
            })
          }, undoHideDelayMs)
          function undoClicked() {
            clearTimeout(hideHiddenVideoTimeout)
            cleanup()
          }
          $undoButton.addEventListener('click', undoClicked)
          $actions.insertAdjacentHTML('beforeend', '<div class="cpfyt-pie"></div>')
        }
      }
    }, {
      name: `<${$container.tagName.toLowerCase()}> (for <ytm-notification-multi-action-renderer> being added)`,
      observers: pageObservers,
    })
  }
}

/** @param {HTMLElement} $menu */
function onDesktopMenuAppeared($menu) {
  log('menu appeared', {$lastClickedElement})

  if (config.downloadTranscript) {
    addDownloadTranscriptToDesktopMenu($menu)
  }
  if (config.hideChannels) {
    addHideChannelToDesktopMenu($menu)
  }
  if (config.hideHiddenVideos) {
    observeVideoHiddenState()
  }
}

/** @param {MouseEvent} e */
function onDocumentClick(e) {
  $lastClickedElement = /** @type {HTMLElement} */ (e.target)
}

/** @param {HTMLElement} $menu */
function onMobileMenuAppeared($menu) {
  log('menu appeared', {$lastClickedElement})

  if (config.hideOpenApp && (isSearchPage() || isVideoPage())) {
    let menuItems = $menu.querySelectorAll('ytm-menu-item')
    for (let $menuItem of menuItems) {
      if ($menuItem.textContent == 'Open App') {
        log('tagging Open App menu item')
        $menuItem.classList.add('open-app-menu-item')
        break
      }
    }
  }

  if (config.hideChannels) {
    addHideChannelToMobileMenu($menu)
  }
  if (config.hideHiddenVideos) {
    observeVideoHiddenState()
  }
}

async function redirectFromHome() {
  let selector = desktop ? 'a[href="/feed/subscriptions"]' : 'ytm-pivot-bar-item-renderer div.pivot-subs'
  let $subscriptionsLink = await getElement(selector, {
    name: 'Subscriptions link',
    stopIf: currentUrlChanges(),
  })
  if (!$subscriptionsLink) return
  log('redirecting from Home to Subscriptions')
  $subscriptionsLink.click()
}

function redirectShort() {
  let videoId = location.pathname.split('/').at(-1)
  let search = location.search ? location.search.replace('?', '&') : ''
  log('redirecting Short to normal player')
  location.replace(`/watch?v=${videoId}${search}`)
}

async function tweakHomePage() {
  if (config.disableHomeFeed && loggedIn) {
    redirectFromHome()
    return
  }

  // Add data-cpfyt-title attribute to titled shelves so they can be hidden by title
  if (desktop && config.hideSuggestedSections) {
    let $rows = await getElement('ytd-browse[page-subtype="home"] ytd-rich-grid-renderer > #contents', {
      name: 'Home rows container',
      stopIf: currentUrlChanges(),
    })
    if (!$rows) return

    /** @param {HTMLElement} $shelf  */
    function addTitleToShelf($shelf) {
      let title = $shelf.querySelector('ytd-rich-shelf-renderer #title')?.textContent
      if (title) {
        $shelf.dataset.cpfytTitle = title
        log('added', title, 'shelf title')
      }
    }

    // Initial contents
    for (let $shelf of $rows.querySelectorAll('ytd-rich-section-renderer')) {
      addTitleToShelf(/** @type {HTMLElement} */ ($shelf))
    }

    observeElement($rows, (mutations) => {
      for (let mutation of mutations) {
        for (let $addedNode of mutation.addedNodes) {
          if ($addedNode.nodeName == 'YTD-RICH-SECTION-RENDERER') {
            addTitleToShelf(/** @type {HTMLElement} */ ($addedNode))
          }
        }
      }
    }, {
      name: '<ytd-rich-grid-renderer> > #contents (for <ytd-rich-section-renderer>s being added)',
      observers: pageObservers,
    })
  }
}

async function tweakSearchPage() {
  // Add data-title attribute to titled shelves so they can be hidden by title
  if (desktop && config.hideSuggestedSections) {
    let $sections = await getElement('ytd-search ytd-section-list-renderer #contents', {
      name: 'search result sections container',
      stopIf: () => !location.pathname.startsWith('/results'),
    })
    if (!$sections) return

    /**  @param {HTMLElement} $shelf */
    function addTitleToShelf($shelf) {
      let title = $shelf.querySelector('#title').textContent
      $shelf.dataset.cpfytTitle = title
      log('added', title, 'shelf title')
    }

    let sectionCount = 0
    /**
     * Tag any shelves in a section and watch for new content being added.
     * @param {HTMLElement} $section
     */
    function processSection($section) {
      let sectionId = ++sectionCount
      observeElement($section.querySelector('#contents'), (mutations) => {
        for (let mutation of mutations) {
          for (let $addedNode of mutation.addedNodes) {
            if ($addedNode.nodeName == 'YTD-SHELF-RENDERER') {
              log(`new shelf added to section ${sectionId}`)
              addTitleToShelf(/** @type {HTMLElement} */ ($addedNode))
            }
          }
        }
      }, {
        name: `<ytd-item-section-renderer> ${sectionId} #contents (for <ytd-shelf-renderer>s being added)`,
        observers: pageObservers,
      })
      for (let $shelf of $section.querySelectorAll('ytd-shelf-renderer')) {
        addTitleToShelf(/** @type {HTMLElement} */ ($shelf))
      }
    }

    // New sections are added when more results are loaded
    observeElement($sections, (mutations) => {
      for (let mutation of mutations) {
        for (let $addedNode of mutation.addedNodes) {
          if ($addedNode.nodeName == 'YTD-ITEM-SECTION-RENDERER') {
            log('new search result section added')
            processSection(/** @type {HTMLElement} */ ($addedNode))
          }
        }
      }
    }, {
      name: '<ytd-section-list-renderer> #contents (for <ytd-item-section-renderer>s being added)',
      observers: pageObservers,
    })

    let $initialSections = $sections.querySelectorAll('ytd-item-section-renderer')
    log($initialSections.length, `initial search result section${s($initialSections.length)}`)
    for (let $initialSection of $initialSections) {
      processSection(/** @type {HTMLElement} */ ($initialSection))
    }
  }
}

async function observeVideoAds() {
  let $player = await getElement('#movie_player', {
    name: 'player',
    stopIf: currentUrlChanges(),
  })
  if (!$player) return

  let $videoAds = $player.querySelector('.video-ads')
  if (!$videoAds) {
    $videoAds = await observeForElement($player, (mutations) => {
      for (let mutation of mutations) {
        for (let $addedNode of mutation.addedNodes) {
          if ($addedNode instanceof HTMLElement && $addedNode.classList.contains('video-ads')) {
            return $addedNode
          }
        }
      }
    }, {
      logElement: true,
      name: '#movie_player (for .video-ads being added)',
      observers: pageObservers,
    })
    if (!$videoAds) return
  }

  // When there are multiple ads, content is removed and re-added
  let unmuteTimeout

  async function processAdContent() {
    //#region Mute ads
    if (unmuteTimeout) {
      clearTimeout(unmuteTimeout)
      unmuteTimeout = null
    }

    // Mute ad audio
    if (desktop) {
      let $muteButton = /** @type {HTMLElement} */ ($player.querySelector('button.ytp-mute-button'))
      if ($muteButton) {
        if ($muteButton.dataset.titleNoTooltip == getString('MUTE')) {
          log('muting ad audio')
          $muteButton.click()
          $muteButton.dataset.cpfytWasMuted = 'false'
        }
        else if ($muteButton.dataset.cpfytWasMuted == null) {
          $muteButton.dataset.cpfytWasMuted = 'true'
        }
      } else {
        warn('mute button not found')
      }
    }
    if (mobile) {
      // Mobile doesn't have a mute button, so we mute the video itself
      let $video = /** @type {HTMLVideoElement} */ ($player.querySelector('video'))
      if ($video) {
        if (!$video.muted) {
          $video.muted = true
          $video.dataset.cpfytWasMuted = 'false'
        }
        else if ($video.dataset.cpfytWasMuted == null) {
          $video.dataset.cpfytWasMuted = 'true'
        }
      } else {
        warn('<video> not found')
      }
    }
    //#endregion

    //#region Skip ads
    // Try to skip to the end of the ad video
    let $video = /** @type {HTMLVideoElement} */ ($player.querySelector('video'))
    if (!$video) {
      warn('<video> not found')
      return
    }

    if (Number.isFinite($video.duration)) {
      log(`skipping to end of ad (using initial video duration)`)
      $video.currentTime = $video.duration
    }
    else if ($video.readyState == null || $video.readyState < 1) {
      function onLoadedMetadata() {
        if (Number.isFinite($video.duration)) {
          log(`skipping to end of ad (using video duration after loadedmetadata)`)
          $video.currentTime = $video.duration
        } else {
          log(`skipping to end of ad (duration still not available after loadedmetadata)`)
          $video.currentTime = 10_000
        }
      }
      $video.addEventListener('loadedmetadata', onLoadedMetadata, {once: true})
      onAdRemoved = () => {
        $video.removeEventListener('loadedmetadata', onLoadedMetadata)
      }
    }
    else {
      log(`skipping to end of ad (metadata should be available but isn't)`)
      $video.currentTime = 10_000
    }
    //#endregion

    // let $skipOrPreview = $videoAds.querySelector('.ytp-ad-player-overlay-skip-or-preview')
    // if (!$skipOrPreview) {
    //   log('ad skip or preview container not found')
    //   return
    // }

    // if ($skipOrPreview.firstElementChild.classList.contains('ytp-ad-preview-slot')) {
    //   log('ad only has a preview button')
    //   return
    // }

    // let $skipButtonSlot = /** @type {HTMLElement} */ ($skipOrPreview.querySelector('.ytp-ad-skip-button-slot'))
    // if (!$skipButtonSlot) {
    //   log('skip button slot not found')
    //   return
    // }

    // observeElement($skipButtonSlot, (_, observer) => {
    //   if ($skipButtonSlot.style.display != 'none') {
    //     let $button = $skipButtonSlot.querySelector('button')
    //     if ($button) {
    //       log('clicking skip button')
    //       // XXX Not working on mobile
    //       $button.click()
    //     } else {
    //       warn('skip button not found')
    //     }
    //     observer.disconnect()
    //   }
    // }, {
    //   leading: true,
    //   name: 'skip button slot',
    //   observers: pageObservers,
    // }, {attributes: true})
  }

  if ($videoAds.childElementCount > 0) {
    log('video ad content present')
    processAdContent()
  }

  observeElement($videoAds, (mutations) => {
    // Nothing added
    if (!mutations.some(mutation => mutation.addedNodes.length > 0)) {
      // Something removed
      if (mutations.some(mutation => mutation.removedNodes.length > 0)) {
        log('video ad content removed')
        if (onAdRemoved) {
          onAdRemoved()
          onAdRemoved = null
        }
        // Only unmute if we know the volume wasn't initially muted
        if (desktop) {
          let $muteButton = /** @type {HTMLElement} */ ($player.querySelector('button.ytp-mute-button'))
          if ($muteButton &&
              $muteButton.dataset.titleNoTooltip != getString('MUTE') &&
              $muteButton.dataset.cpfytWasMuted == 'false') {
            unmuteTimeout = setTimeout(() => {
              log('unmuting audio after ads')
              $muteButton.click()
              unmuteTimeout = null
              delete $muteButton.dataset.cpfytWasMuted
            }, 500)
          }
        }
        if (mobile) {
          let $video = $player.querySelector('video')
          if ($video &&
              $video.muted &&
              $video.dataset.cpfytWasMuted == 'false') {
            unmuteTimeout = setTimeout(() => {
              log('unmuting audio after ads')
              $video.muted = false
              unmuteTimeout = null
              delete $video.dataset.cpfytWasMuted
            }, 500)
          }
        }
      }
      return
    }

    log('video ad content appeared')
    processAdContent()
  }, {
    logElement: true,
    name: '#movie_player > .video-ads (for content being added or removed)',
    observers: pageObservers,
  })
}

async function tweakVideoPage() {
  if (config.skipAds) {
    observeVideoAds()
  }
  if (config.disableAutoplay) {
    disableAutoplay()
  }
}
//#endregion

//#region Main
let isUserscript =  !(
  typeof GM == 'undefined' &&
  typeof chrome != 'undefined' &&
  typeof chrome.storage != 'undefined'
)

function main() {
  if (config.enabled) {
    configureCss()
    observeTitle()
    observePopups()
    document.addEventListener('click', onDocumentClick, true)
  }
}

/** @param {Partial<import("./types").SiteConfig>} changes */
function configChanged(changes) {
  if (!changes.hasOwnProperty('enabled')) {
    log('config changed', changes)
    // Update styles
    configureCss()
    // Re-run any functionality for the current URL
    handleCurrentUrl()
    return
  }

  log(`${changes.enabled ? 'en' : 'dis'}abling extension functionality`)
  if (changes.enabled) {
    main()
  } else {
    configureCss()
    disconnectObservers(pageObservers, 'page')
    disconnectObservers(globalObservers,' global')
    document.removeEventListener('click', onDocumentClick, true)
  }
}

/** @param {{[key: string]: chrome.storage.StorageChange}} storageChanges */
function onConfigChange(storageChanges) {
  let configChanges = Object.fromEntries(
    Object.entries(storageChanges)
      // Don't change the version based on other pages
      .filter(([key]) => config.hasOwnProperty(key) && key != 'version')
      .map(([key, {newValue}]) => [key, newValue])
  )
  if (Object.keys(configChanges).length > 0) {
    Object.assign(config, configChanges)
    configChanged(configChanges)
  }
}

/** @param {Partial<import("./types").SiteConfig>} configChanges */
function storeConfigChanges(configChanges) {
  if (isUserscript) return
  chrome.storage.local.onChanged.removeListener(onConfigChange)
  chrome.storage.local.set(configChanges, () => {
    chrome.storage.local.onChanged.addListener(onConfigChange)
  })
}

if (!isUserscript) {
  chrome.storage.local.get((storedConfig) => {
    Object.assign(config, storedConfig)
    log('initial config', {...config, version}, {lang, loggedIn})

    // Let the options page know which version is being used
    chrome.storage.local.set({version})
    chrome.storage.local.onChanged.addListener(onConfigChange)

    window.addEventListener('unload', () => {
      chrome.storage.local.onChanged.removeListener(onConfigChange)
    }, {once: true})

    main()
  })
}
else {
  main()
}
//#endregion