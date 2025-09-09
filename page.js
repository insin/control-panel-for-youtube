void function() {

//#region Default config
/** @type {import("./types").SiteConfig} */
let defaultConfig = {
  enabled: true,
  debug: false,
  debugManualHiding: false,
  alwaysShowShortsProgressBar: false,
  blockAds: true,
  disableAmbientMode: true,
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
  hidePremiumUpsells: false,
  hideRelated: false,
  hideShareThanksClip: false,
  hideShorts: true,
  hideShortsSuggestedActions: true,
  hideSponsored: true,
  hideStreamed: false,
  hideSuggestedSections: true,
  hideUpcoming: false,
  hideVoiceSearch: false,
  hideWatched: true,
  hideWatchedThreshold: '80',
  redirectShorts: true,
  removePink: false,
  stopShortsLooping: true,
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
  hideMerchEtc: false,
  hideMiniplayerButton: false,
  hideShortsMetadataUntilHover: true,
  hideShortsRemixButton: true,
  hideSubscriptionsLatestBar: false,
  minimumGridItemsPerRow: 'auto',
  minimumShortsPerRow: 'auto',
  pauseChannelTrailers: true,
  redirectLogoToSubscriptions: false,
  searchThumbnailSize: 'medium',
  snapshotFormat: 'jpeg',
  snapshotQuality: '0.92',
  tidyGuideSidebar: false,
  // Mobile only
  allowBackgroundPlay: true,
  hideExploreButton: true,
  hideOpenApp: true,
  hideSubscriptionsChannelList: false,
  mobileGridView: true,
}
//#endregion

let debug = false
let debugManualHiding = false

let mobile = location.hostname == 'm.youtube.com'
let desktop = !mobile
/** @type {import("./types").Version} */
let version = mobile ? 'mobile' : 'desktop'
/** @type {string} */
let lang
/** @type {string[]} */
let langCodes = []
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

/** @type {import("./types").SiteConfig} */
let config

//#region Locales
/**
 * @type {Record<string, import("./types").Locale>}
 */
const locales = {
  'af-ZA': {
    ORIGINAL: 'oorspronklike',
    SHORTS: "Kortvideo's",
  },
  'am-ET': {
    ORIGINAL: 'የመጀመሪያ',
    SHORTS: 'ቁምጣ',
  },
  ar: {
    ORIGINAL: 'أصلي',
    SHORTS: 'Shorts',
  },
  'as-IN': {
    ORIGINAL: 'মূল',
    SHORTS: 'Shorts',
  },
  'az-Latn-AZ': {
    ORIGINAL: 'orijinal',
    SHORTS: 'Shorts',
  },
  'be-BY': {
    ORIGINAL: 'арыгінальны',
    SHORTS: 'Кароткія відэа',
  },
  'bg-BG': {
    ORIGINAL: 'оригинален',
    SHORTS: 'Кратки видеоклипове',
  },
  'bn-BD': {
    ORIGINAL: 'মূল',
    SHORTS: 'Shorts',
  },
  'bs-Latn-BA': {
    ORIGINAL: 'original',
    SHORTS: 'Shorts',
  },
  'ca-ES': {
    ORIGINAL: 'original',
    SHORTS: 'Curts',
  },
  'cs-CZ': {
    ORIGINAL: 'původní',
    SHORTS: 'Shorts',
  },
  'da-DK': {
    ORIGINAL: 'originalt',
    SHORTS: 'Shorts',
  },
  'de-DE': {
    ORIGINAL: 'Original',
    SHORTS: 'Shorts',
  },
  'el-GR': {
    ORIGINAL: 'πρωτότυπο',
    SHORTS: 'Shorts',
  },
  en: {
    CLIP: 'Clip',
    HIDE_CHANNEL: 'Hide channel',
    MIXES: 'Mixes',
    ORIGINAL: 'original',
    SHARE: 'Share',
    SHORTS: 'Shorts',
    STREAMED_METADATA_INNERTEXT_RE: '(?:^|\\n)\\s*Streamed',
    STREAMED_TITLE_ARIA_LABEL: 'views Streamed',
    TAKE_SNAPSHOT: 'Take snapshot',
    TELL_US_WHY: 'Tell us why',
    THANKS: 'Thanks',
    UNHIDE_CHANNEL: 'Unhide channel',
  },
  'es-419': {
    ORIGINAL: 'original',
    SHORTS: 'Shorts',
  },
  'es-ES': {
    ORIGINAL: 'original',
    SHORTS: 'Shorts',
  },
  'es-US': {
    ORIGINAL: 'original',
    SHORTS: 'Shorts',
  },
  'et-EE': {
    ORIGINAL: 'algne',
    SHORTS: 'Lühivideod',
  },
  'eu-ES': {
    ORIGINAL: 'jatorrizkoa',
    SHORTS: 'Film laburrak',
  },
  'fa-IR': {
    ORIGINAL: 'اصلی',
    SHORTS: 'کوته‌ویدیوهای YouTube',
  },
  'fil-PH': {
    ORIGINAL: 'orihinal',
    SHORTS: 'Shorts',
  },
  'fr-CA': {
    ORIGINAL: 'originale',
    SHORTS: 'Shorts',
  },
  'fr-FR': {
    HIDE_CHANNEL: 'Masquer la chaîne',
    MIXES: 'Mix',
    ORIGINAL: 'original',
    SHARE: 'Partager',
    SHORTS: 'Shorts',
    STREAMED_METADATA_INNERTEXT_RE: '(?:^|\\n)\\s*Diffusé',
    STREAMED_TITLE_ARIA_LABEL: 'vues Diffusé',
    TAKE_SNAPSHOT: 'Prendre une capture',
    TELL_US_WHY: 'Dites-nous pourquoi',
    THANKS: 'Merci',
    UNHIDE_CHANNEL: 'Afficher la chaîne',
  },
  'gl-ES': {
    ORIGINAL: 'orixinal',
    SHORTS: 'Curtas',
  },
  'gu-IN': {
    ORIGINAL: 'ઑરિજિનલ',
    SHORTS: 'Shorts',
  },
  'he-IL': {
    ORIGINAL: 'מקור',
    SHORTS: 'סרטוני Shorts',
  },
  'hi-IN': {
    ORIGINAL: 'मूल',
    SHORTS: 'Shorts',
  },
  'hr-HR': {
    ORIGINAL: 'izvorno',
    SHORTS: 'Shorts',
  },
  'hu-HU': {
    ORIGINAL: 'eredeti',
    SHORTS: 'Rövid videók',
  },
  'hy-AM': {
    ORIGINAL: 'բնօրինակ',
    SHORTS: 'Կարճ հոլովակներ',
  },
  'id-ID': {
    ORIGINAL: 'asli',
    SHORTS: 'Shorts',
  },
  'is-IS': {
    ORIGINAL: 'upprunalegt',
    SHORTS: 'Shorts',
  },
  'it-IT': {
    ORIGINAL: 'originale',
    SHORTS: 'Short',
  },
  'ja-JP': {
    CLIP: 'クリップ',
    HIDE_CHANNEL: 'チャンネルを隠す',
    MIXES: 'ミックス',
    ORIGINAL: 'オリジナル',
    SHARE: '共有',
    SHORTS: 'ショート',
    STREAMED_METADATA_INNERTEXT_RE: 'に配信済み\\s*$',
    STREAMED_TITLE_ARIA_LABEL: '前 に配信済み',
    TAKE_SNAPSHOT: 'スナップショットを撮る',
    TELL_US_WHY: '理由を教えてください',
    UNHIDE_CHANNEL: 'チャンネルの再表示',
  },
  'ka-GE': {
    ORIGINAL: 'ორიგინალია',
    SHORTS: 'Shorts',
  },
  'kk-KZ': {
    ORIGINAL: 'түпнұсқа',
    SHORTS: 'Shorts',
  },
  'km-KH': {
    ORIGINAL: 'ដើម',
    SHORTS: 'Shorts',
  },
  'kn-IN': {
    ORIGINAL: 'ಮೂಲ',
    SHORTS: 'Shorts',
  },
  'ko-KR': {
    ORIGINAL: '원본',
    SHORTS: 'Shorts',
  },
  'ky-KG': {
    ORIGINAL: 'түпнуска',
    SHORTS: 'Кыска видеолор',
  },
  'lo-LA': {
    ORIGINAL: 'ຕົ້ນສະບັບ',
    SHORTS: 'Shorts',
  },
  'lt-LT': {
    ORIGINAL: 'pradinis',
    SHORTS: 'Klipukai',
  },
  'lv-LV': {
    ORIGINAL: 'oriģināls',
    SHORTS: 'Īsie videoklipi',
  },
  'mk-MK': {
    ORIGINAL: 'оригинален',
    SHORTS: 'Shorts',
  },
  'ml-IN': {
    ORIGINAL: 'ഒറിജിനൽ',
    SHORTS: 'Shorts',
  },
  'mn-MN': {
    ORIGINAL: 'эх хувь',
    SHORTS: 'Shorts',
  },
  'mr-IN': {
    ORIGINAL: 'मूळ',
    SHORTS: 'शॉर्ट',
  },
  'ms-MY': {
    ORIGINAL: 'asal',
    SHORTS: 'Shorts',
  },
  'my-MM': {
    ORIGINAL: 'မူရင်း',
    SHORTS: 'Shorts',
  },
  'nb-NO': {
    ORIGINAL: 'original',
    SHORTS: 'Shorts',
  },
  'ne-NP': {
    ORIGINAL: 'मूल',
    SHORTS: 'Shorts',
  },
  'nl-NL': {
    ORIGINAL: 'Originele',
    SHORTS: 'Shorts',
  },
  'or-IN': {
    ORIGINAL: 'ମୂଳ',
    SHORTS: 'Shorts',
  },
  'pa-Guru-IN': {
    ORIGINAL: 'ਮੂਲ',
    SHORTS: 'Shorts',
  },
  'pl-PL': {
    ORIGINAL: 'oryginalny',
    SHORTS: 'Shorts',
  },
  'pt-BR': {
    ORIGINAL: 'original',
    SHORTS: 'Shorts',
  },
  'pt-PT': {
    ORIGINAL: 'original',
    SHORTS: 'Shorts',
  },
  'ro-RO': {
    ORIGINAL: 'original',
    SHORTS: 'Shorts',
  },
  'ru-RU': {
    ORIGINAL: 'оригинальная',
    SHORTS: 'Shorts',
  },
  'si-LK': {
    ORIGINAL: 'මුල්',
    SHORTS: 'Shorts',
  },
  'sk-SK': {
    ORIGINAL: 'pôvodná',
    SHORTS: 'Shorts',
  },
  'sl-SI': {
    ORIGINAL: 'Izvirnik',
    SHORTS: 'Kratki videoposnetki',
  },
  'sq-AL': {
    ORIGINAL: 'origjinale',
    SHORTS: 'Shorts',
  },
  'sr-Cyrl-RS': {
    ORIGINAL: 'оригинална',
    SHORTS: 'Шортси',
  },
  'sr-Latn-RS': {
    ORIGINAL: 'originalna',
    SHORTS: 'Šortsi',
  },
  'sw-TZ': {
    ORIGINAL: 'halisi',
    SHORTS: 'Video Fupi',
  },
  'ta-IN': {
    ORIGINAL: 'அசல்',
    SHORTS: 'Shorts வீடியோக்கள்',
  },
  'te-IN': {
    ORIGINAL: 'అసలైనది',
    SHORTS: 'షార్ట్‌లు',
  },
  'th-TH': {
    ORIGINAL: 'เสียงต้นฉบับ',
    SHORTS: 'วิดีโอสั้น',
  },
  'tr-TR': {
    ORIGINAL: 'orijinal',
    SHORTS: 'Shorts',
  },
  'uk-UA': {
    ORIGINAL: 'оригінал',
    SHORTS: 'Відео Shorts',
  },
  'ur-PK': {
    ORIGINAL: 'اصل',
    SHORTS: 'Shorts',
  },
  'uz-Latn-UZ': {
    ORIGINAL: 'original',
    SHORTS: 'Shorts',
  },
  'vi-VN': {
    ORIGINAL: 'gốc',
    SHORTS: 'Shorts',
  },
  'zh-Hans-CN': {
    CLIP: '剪辑',
    HIDE_CHANNEL: '隐藏频道',
    MIXES: '合辑',
    ORIGINAL: '原始',
    SHARE: '分享',
    SHORTS: '短视频',
    STREAMED_METADATA_INNERTEXT_RE: '直播时间：',
    STREAMED_TITLE_ARIA_LABEL: '直播时间：',
    TAKE_SNAPSHOT: '截取快照',
    TELL_US_WHY: '告诉我们原因',
    THANKS: '感谢',
    UNHIDE_CHANNEL: '取消隐藏频道',
  },
  'zh-Hant-HK': {
    ORIGINAL: '原聲',
    SHORTS: 'Shorts',
  },
  'zh-Hant-TW': {
    ORIGINAL: '原文',
    SHORTS: 'Shorts',
  },
  'zu-ZA': {
    ORIGINAL: 'yokuqala',
    SHORTS: 'Okufushane',
  },
}

/**
 * @param {import("./types").LocaleKey} code
 * @returns {string}
 */
function getString(code) {
  for (let langCode of langCodes) {
    if (Object.hasOwn(locales[langCode], code)) {
      return locales[langCode][code]
    }
  }
}

function getYtString(...keys) {
  for (let key of keys) {
    // @ts-ignore
    let string = window.ytcfg?.msgs?.[key]
    if (string) return string
  }
  warn(`ytcfg.msgs key not found:`, keys)
}
//#endregion

//#region Constants
const undoHideDelayMs = 5000

const Classes = {
  HIDE_CHANNEL: 'cpfyt-hide-channel',
  HIDE_HIDDEN: 'cpfyt-hide-hidden',
  HIDE_OPEN_APP: 'cpfyt-hide-open-app',
  HIDE_STREAMED: 'cpfyt-hide-streamed',
  HIDE_WATCHED: 'cpfyt-hide-watched',
  HIDE_SHARE_THANKS_CLIP: 'cpfyt-hide-share-thanks-clip',
}

/**
 * @type {Record<string, {
 *   itemSelector: string
 *   itemTextSelector: string
 * }>} menu tag name to config
 */
const MenuConfigs = {
  'TP-YT-PAPER-LISTBOX': {
    itemSelector: 'ytd-menu-service-item-renderer',
    itemTextSelector: 'yt-formatted-string',
  },
  'YT-LIST-ITEM-VIEW-MODEL': {
    itemSelector: 'yt-list-item-view-model',
    itemTextSelector: '.yt-list-item-view-model__title',
  },
}

const Svgs = {
  DELETE: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" style="pointer-events: none; display: block; width: 100%; height: 100%;"><path d="M11 17H9V8h2v9zm4-9h-2v9h2V8zm4-4v1h-1v16H6V5H5V4h4V3h6v1h4zm-2 1H7v15h10V5z"></path></svg>',
  RESTORE: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" focusable="false" style="pointer-events: none; display: block; width: 100%; height: 100%;"><path d="M460-347.692h40V-535.23l84 83.538L612.308-480 480-612.308 347.692-480 376-451.692l84-83.538v187.538ZM304.615-160Q277-160 258.5-178.5 240-197 240-224.615V-720h-40v-40h160v-30.77h240V-760h160v40h-40v495.385Q720-197 701.5-178.5 683-160 655.385-160h-350.77ZM680-720H280v495.385q0 9.23 7.692 16.923Q295.385-200 304.615-200h350.77q9.23 0 16.923-7.692Q680-215.385 680-224.615V-720Zm-400 0v520-520Z"/></svg>',
}

// YouTube channel URLs: https://support.google.com/youtube/answer/6180214
const URL_CHANNEL_RE = /\/(?:@[^\/]+|(?:c|channel|user)\/[^\/]+)(?:\/(featured|videos|shorts|playlists|community))?\/?$/
//#endregion

//#region State
/** @type {boolean} */
let realDocumentHidden
/** @type {Map<string, import("./types").Disconnectable>} */
let globalObservers = new Map()
/** @type {import("./types").Channel} */
let lastClickedChannel
/** @type {HTMLElement} */
let $lastClickedElement
/** @type {() => void} */
let onDialogClosed
/** @type {Map<string, import("./types").Disconnectable>} */
let pageObservers = new Map()
//#endregion

//#region Utilities
function addStyle(css = '') {
  let $style = document.createElement('style')
  if (css) {
    $style.textContent = css
  }
  document.documentElement.appendChild($style)
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

/** @param {Map<string, import("./types").Disconnectable>} observers */
function disconnectObservers(observers, scope) {
  if (observers.size == 0) return
  log(
    `disconnecting ${observers.size} ${scope} observer${s(observers.size)}`,
    Array.from(observers.keys())
  )
  logObserverDisconnects = false
  for (let observer of observers.values()) observer.disconnect()
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
       log(`${name || selector} appeared after`, Date.now() - startTime, 'ms')
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

let policy = window.trustedTypes?.createPolicy?.('tagged-html-policy', {createHTML: (s) => s}) || {createHTML: (s) => s}
function html(strings, ...values) {
  return /** @type {string} */ (policy.createHTML(strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '')))
}

/** @param {import("./types").Channel} channel */
function isChannelHidden(channel) {
  return config.hiddenChannels.some((hiddenChannel) =>
    channel.url && hiddenChannel.url ? channel.url == hiddenChannel.url : hiddenChannel.name == channel.name
  )
}

let logObserverDisconnects = true

/**
 * Convenience wrapper for the MutationObserver API:
 *
 * - Defaults to {childList: true}
 * - Observers have associated names
 * - Optional leading call for callback
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
 *   observers: Map<string, import("./types").Disconnectable> | Map<string, import("./types").Disconnectable>[]
 *   onDisconnect?: () => void
 * }} options
 * @param {MutationObserverInit} mutationObserverOptions
 * @return {import("./types").CustomMutationObserver}
 */
function observeElement($target, callback, options, mutationObserverOptions = {childList: true}) {
  let {leading, logElement, name, observers, onDisconnect} = options
  let observerMaps = Array.isArray(observers) ? observers : [observers]

  /** @type {import("./types").CustomMutationObserver} */
  let observer = Object.assign(new MutationObserver(callback), {name})
  let disconnect = observer.disconnect.bind(observer)
  let disconnected = false
  observer.disconnect = () => {
    if (disconnected) return
    disconnected = true
    disconnect()
    for (let map of observerMaps) map.delete(name)
    onDisconnect?.()
    if (logObserverDisconnects) {
      log(`disconnected ${name} observer`)
    }
  }

  if (observerMaps[0].has(name)) {
    log(`disconnecting existing ${name} observer`)
    logObserverDisconnects = false
    observerMaps[0].get(name).disconnect()
    logObserverDisconnects = true
  }

  for (let map of observerMaps) map.set(name, observer)
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
 * @template T
 * @param {() => T} fn
 */
function run(fn) {
  return fn()
}

/**
 * @param {number} n
 * @returns {string}
 */
function s(n) {
  return n == 1 ? '' : 's'
}

/**
 * @param {() => any} fn
 * @param {string} name
 */
function waitFor(fn, name) {
  return new Promise((resolve) => {
    let startTime = Date.now()
    function check() {
      if (fn()) {
        let elapsed = Date.now() - startTime
        if (elapsed > 0) {
          log(name, 'became available after', Date.now() - startTime, 'ms')
        }
        resolve()
        return
      }
      requestAnimationFrame(check)
    }
    check()
  })
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

    if (config.alwaysShowShortsProgressBar) {
      if (desktop) {
        cssRules.push('.ytPlayerProgressBarHostHidden { opacity: 100 !important; }')
      }
      if (mobile) {
        cssRules.push('.ytMwebShortsPlayerControlsHostHideProgressBar { visibility: visible !important; }')
      }
    }

    if (config.disableAmbientMode) {
      if (desktop) {
        hideCssSelectors.push('#cinematics, #cinematic-container.ytd-reel-video-renderer')
      }
      if (mobile) {
        hideCssSelectors.push('.below-the-player-cinematic-container')
      }
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

    if (config.hideAI) {
      // e.g. https://www.youtube.com/results?search_query=howtobasic+wedges
      if (desktop) {
        const geminiSvgPath = 'M480-80q0-83-31.5-156T363-363q-54-54-127-85.5T80-480q83 0 156-31.5T363-597q54-54 85.5-127T480-880q0 83 31.5 156T597-597q54 54 127 85.5T880-480q-83 0-156 31.5T597-363q-54 54-85.5 127T480-80Z'
        hideCssSelectors.push(`#expandable-metadata:has(path[d="${geminiSvgPath}"])`)
      }
      if (mobile) {
        const geminiSvgPath = 'M6 0c0 3.314-2.69 6-6 6 3.31 0 6 2.686 6 6 0-3.314 2.69-6 6-6-3.31 0-6-2.686-6-6Z'
        hideCssSelectors.push(`ytm-expandable-metadata-renderer:has(path[d="${geminiSvgPath}"])`)
      }
    }

    if (config.hideChannelBanner) {
      if (desktop) {
        hideCssSelectors.push('ytd-browse[page-subtype="channels"] #page-header-banner')
      }
      if (mobile) {
        hideCssSelectors.push('html[cpfyt-page="channel"] .yt-page-header-view-model__page-header-banner-container')
      }
    }

    if (config.hideHomeCategories) {
      if (desktop) {
        hideCssSelectors.push('ytd-browse[page-subtype="home"] #header')
        // Remove the hidden header's height from the frosted glass element
        cssRules.push(`
          #frosted-glass.with-chipbar {
            height: 56px !important;
          }
        `)
      }
      if (mobile) {
        hideCssSelectors.push('.tab-content[tab-identifier="FEwhat_to_watch"] .rich-grid-sticky-header')
      }
    }

    // We only hide channels in Home, Search and Related videos
    if (config.hideChannels) {
      if (config.hiddenChannels.length > 0) {
        if (debugManualHiding) {
          cssRules.push(`.${Classes.HIDE_CHANNEL} { outline: 2px solid red !important; }`)
        } else {
          hideCssSelectors.push(`.${Classes.HIDE_CHANNEL}`)
        }
      }
      if (desktop) {
        // Custom elements can't be cloned so we need to style our own menu items
        cssRules.push(`
          .cpfyt-menu-item {
            align-items: center;
            cursor: pointer;
            display: flex !important;
            min-height: 36px;
            padding: 0 12px 0 16px;
            color: var(--yt-spec-text-primary);
          }
          tp-yt-paper-listbox .cpfyt-menu-item {
            -webkit-font-smoothing: antialiased;
          }
          tp-yt-paper-listbox .cpfyt-menu-item:focus {
            position: relative;
            background-color: var(--paper-item-focused-background-color);
            outline: 0;
          }
          tp-yt-paper-listbox .cpfyt-menu-item:focus::before {
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
          tp-yt-paper-listbox .cpfyt-menu-item:hover {
            background-color: var(--yt-spec-10-percent-layer);
          }
          yt-list-view-model .cpfyt-menu-item:focus {
            outline: 2px solid currentColor;
            outline-offset: -2px;
            border-radius: 8px;
          }
          yt-list-view-model .cpfyt-menu-item:is(:hover, :focus) {
            background-color: rgba(0, 0, 0, .05);
          }
          html[dark] yt-list-view-model .cpfyt-menu-item:is(:hover, :focus) {
            background-color: rgba(255, 255, 255, .1);
          }
          .cpfyt-menu-icon {
            color: var(--yt-spec-text-primary);
            fill: currentColor;
            height: 24px;
            margin-right: 16px;
            width: 24px;
          }
          yt-list-view-model .cpfyt-menu-icon {
            margin-right: 12px;
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
    } else {
      // Hide menu item if config is changed after it's added
      hideCssSelectors.push('#cpfyt-hide-channel-menu-item')
    }

    if (config.hideComments) {
      if (desktop) {
        hideCssSelectors.push(
          '#comments',
          // Shorts comments button
          '#comments-button.ytd-reel-player-overlay-renderer',
        )
      }
      if (mobile) {
        hideCssSelectors.push(
          'ytm-slim-video-metadata-section-renderer + ytm-item-section-renderer',
          // Shorts comments button
          'ytm-button-renderer.icon-shorts_comment',
        )
      }
    }

    if (config.hideHiddenVideos) {
      cssRules.push(`
        .cpfyt-pie {
          --cpfyt-pie-delay: 0ms;
          --cpfyt-pie-direction: normal;
          --cpfyt-pie-duration: ${undoHideDelayMs}ms;
          --cpfyt-pie-fontSize: 200%;
          width: 1em;
          height: 1em;
          font-size: var(--cpfyt-pie-fontSize);
          position: relative;
          border-radius: 50%;
          margin: 0.5em;
          display: inline-block;
          cursor: pointer;
          flex-shrink: 0;
        }
        .cpfyt-pie:hover {
          --cpfyt-pie-color: #f03 !important;
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
      if (debugManualHiding) {
        cssRules.push(`.${Classes.HIDE_HIDDEN} { outline: 2px solid magenta !important; }`)
      } else {
        hideCssSelectors.push(`.${Classes.HIDE_HIDDEN}`)
      }
    }

    if (config.hideInfoPanels) {
      if (desktop) {
        hideCssSelectors.push(
          // Search
          'ytd-clarification-renderer',
          'ytd-info-panel-container-renderer',
          // Below video
          '#middle-row.ytd-watch-metadata:has(> ytd-info-panel-content-renderer:only-child)',
          'ytd-info-panel-content-renderer',
          '#clarify-box',
        )
      }
      if (mobile) {
        hideCssSelectors.push(
          // Search and below video
          'ytm-clarification-renderer',
          'ytm-info-panel-container-renderer',
        )
      }
    }

    if (config.hideLive) {
      if (desktop) {
        hideCssSelectors.push(
          // Grid item (Home, Subscriptions)
          'ytd-browse:not([page-subtype="channels"]) ytd-rich-item-renderer:has(ytd-thumbnail[is-live-video])',
          'ytd-browse:not([page-subtype="channels"]) ytd-rich-item-renderer:has(.yt-badge-shape--thumbnail-live)',
          // List item (Search)
          'ytd-video-renderer:has(ytd-thumbnail[is-live-video])',
          // Related
          'ytd-compact-video-renderer:has(> .ytd-compact-video-renderer > ytd-thumbnail[is-live-video])',
          '#related yt-lockup-view-model:has(.yt-badge-shape--thumbnail-live)',
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
          // Large item in Related videos
          'ytm-item-section-renderer[section-identifier="related-items"] > lazy-list > ytm-compact-autoplay-renderer:has(ytm-thumbnail-overlay-time-status-renderer[data-style="LIVE"])',
          // Related
          'ytm-item-section-renderer[section-identifier="related-items"] > lazy-list > ytm-video-with-context-renderer:has(ytm-thumbnail-overlay-time-status-renderer[data-style="LIVE"])',
        )
      }
    }

    if (config.hideMembersOnly) {
      if (desktop) {
        const membersOnlyIconPath = 'path[d="M6 11.5a5.5 5.5 0 100-11 5.5 5.5 0 000 11Zm1.058-6.956L6 2 4.942 4.544l-2.746.22 2.092 1.792-.64 2.68L6 7.8l2.351 1.436-.64-2.68 2.093-1.792-2.746-.22Z"]'
        hideCssSelectors.push(
          // Grid item (Home, Subscriptions, Channel videos tab)
          'ytd-rich-item-renderer:has(.badge-style-type-members-only)',
          `ytd-rich-item-renderer:has(${membersOnlyIconPath})`,
          // List item (Search)
          'ytd-video-renderer:has(.badge-style-type-members-only)',
          // Related
          'ytd-compact-video-renderer:has(.badge-style-type-members-only)',
          `#related yt-lockup-view-model:has(${membersOnlyIconPath})`,
          // Playlist in channel Home tab
          'ytd-item-section-renderer[page-subtype="channels"]:has(.badge-style-type-members-only)',
          // Video endscreen
          // TODO Hide by href based on any of the first 12 items in #related being members only videos
        )
      }
      if (mobile) {
        hideCssSelectors.push(
          // Home
          'ytm-rich-item-renderer:has(ytm-badge[data-type="BADGE_STYLE_TYPE_MEMBERS_ONLY"])',
          // Subscriptions
          '.tab-content[tab-identifier="FEsubscriptions"] ytm-item-section-renderer:has(ytm-badge[data-type="BADGE_STYLE_TYPE_MEMBERS_ONLY"])',
          // Search
          'ytm-search ytm-video-with-context-renderer:has(ytm-badge[data-type="BADGE_STYLE_TYPE_MEMBERS_ONLY"])',
          // Playlist in channel Home tab
          `ytm-browse .tab-content[tab-title="${getYtString('HOME')}"] ytm-shelf-renderer:has(ytm-badge[data-type="BADGE_STYLE_TYPE_MEMBERS_ONLY"])`,
        )
      }
    }

    if (config.hideMetadata) {
      if (desktop) {
        hideCssSelectors.push(
          // Channel name / Videos / About (but not Transcript or their mutual container)
          '#structured-description .ytd-structured-description-content-renderer:not(#items, ytd-video-description-transcript-section-renderer)',
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
          // Music
          'ytm-structured-description-content-renderer ytm-horizontal-card-list-renderer',
        )
      }
    }

    if (config.hideMixes) {
      if (desktop) {
        hideCssSelectors.push(
          // Chip in Home
          `yt-chip-cloud-chip-renderer:has(> #chip-container > yt-formatted-string[title="${getString('MIXES')}"])`,
          // Grid item
          'ytd-rich-item-renderer:has(a[href*="start_radio=1"])',
          // List item
          'ytd-radio-renderer',
          // Related
          'ytd-compact-radio-renderer',
          // Search result and related video
          'yt-lockup-view-model:has(a[href*="start_radio=1"])',
          // Video endscreen item
          '.ytp-videowall-still[data-is-mix="true"]',
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

    if (config.hideMoviesAndTV) {
      if (desktop) {
        hideCssSelectors.push(
          // Home
          'ytd-rich-item-renderer.ytd-rich-grid-renderer:has(a[href*="&pp=sAQB"])',
          // Search
          'ytd-movie-renderer',
          // Related
          'ytd-compact-movie-renderer',
          'ytd-compact-video-renderer:has(a[href*="&pp=sAQB"])',
        )
      }
      if (mobile) {
        hideCssSelectors.push(
          // Home
          '.tab-content[tab-identifier="FEwhat_to_watch"] ytm-rich-item-renderer:has(a[href*="&pp=sAQB"])',
          // Search
          'ytm-search ytm-video-with-context-renderer:has(ytm-badge[data-type="BADGE_STYLE_TYPE_YPC"])',
          // Related
          'ytm-item-section-renderer[section-identifier="related-items"] ytm-video-with-context-renderer:has(a[href*="&pp=sAQB"])',
        )
      }
    }

    if (config.hideNextButton) {
      if (desktop) {
        // Hide the Next by default so it doesn't flash in and out of visibility
        // Show Next if Previous is enabled (e.g. when viewing a playlist video)
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
        hideCssSelectors.push(
          // Hide the Previous button when it's disabled, as it otherwise takes you to the previously-watched video
          `.player-controls-middle-core-buttons button[aria-label="${getYtString('PREVIOUS_VIDEO')}"][aria-disabled="true"]`,
          // Always hide the Next button as it takes you to a random video, even if you just used Previous
          `.player-controls-middle-core-buttons button[aria-label="${getYtString('NEXT_VIDEO')}"]`,
        )
      }
    }

    if (config.hidePlaylists) {
      if (desktop) {
        hideCssSelectors.push(
          // Home
          'ytd-browse[page-subtype="home"] ytd-rich-item-renderer:has(a[href^="/playlist?"])',
          // Search and Related
          ':is(#related, ytd-search) yt-lockup-view-model:has(a[href^="/playlist?"])',
          // Video endscreen
          '.ytp-videowall-still[data-is-list="true"][data-is-mix="false"]',
        )
      }
      if (mobile) {
        hideCssSelectors.push(
          // Home
          '.tab-content[tab-identifier="FEwhat_to_watch"] ytm-rich-item-renderer:has(a[href^="/playlist?"])',
          // Search
          'ytm-search ytm-compact-playlist-renderer',
          // Related
          'ytm-item-section-renderer[section-identifier="related-items"] ytm-compact-playlist-renderer',
        )
      }
    }

    if (config.hidePremiumUpsells) {
      if (desktop) {
        hideCssSelectors.push(
          // Sidebar item
          '#endpoint.ytd-guide-entry-renderer[href="/premium"]',
          // Download menu item
          'ytd-menu-service-item-download-renderer',
          'yt-download-list-item-view-model',
          // 1080p Premium quality menu item
          '.ytp-quality-menu .ytp-menuitem:has(.ytp-premium-label)',
          // Download button
          'ytd-download-button-renderer',
        )
      }
      if (mobile) {
        hideCssSelectors.push(
          // Item in You page
          '.tab-content[tab-identifier="FElibrary"] ytm-compact-link-renderer:has(> a[href="/premium"])',
        )
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

    if (config.hideShareThanksClip) {
      if (desktop) {
        hideCssSelectors.push(
          // Video buttons
          `ytd-menu-renderer yt-button-view-model:has(> button-view-model > button[aria-label="${getString('SHARE')}"])`,
          `ytd-menu-renderer yt-button-view-model:has(> button-view-model > button[aria-label="${getString('THANKS')}"])`,
          `ytd-menu-renderer yt-button-view-model:has(> button-view-model > button[aria-label="${getString('CLIP')}"])`,
          // Menu items
          `.${Classes.HIDE_SHARE_THANKS_CLIP}`,
          // Shorts button
          '#share-button.ytd-reel-player-overlay-renderer',
        )
      }
      if (mobile) {
        hideCssSelectors.push(
          // Video button
          `ytm-slim-video-action-bar-renderer button-view-model:has(button[aria-label="${getString('SHARE')}"])`,
          // Shorts button
          '.reel-player-overlay-actions .icon-shorts_share',
        )
      }
    }

    if (config.hideShorts) {
      hideCssSelectors.push('.HideShorts')
      if (desktop) {
        hideCssSelectors.push(
          // Side nav item
          `ytd-guide-entry-renderer:has(> a[title="${getString('SHORTS')}"])`,
          // Mini side nav item
          `ytd-mini-guide-entry-renderer[aria-label="${getString('SHORTS')}"]`,
          // Grid shelf
          'ytd-rich-section-renderer:has(> #content > ytd-rich-shelf-renderer[is-shorts])',
          // Group of 3 Shorts in Home grid
          'ytd-browse[page-subtype="home"] ytd-rich-grid-group',
          // Individual Short in Home grid
          'ytd-browse[page-subtype="home"] ytd-rich-item-renderer[is-slim-media][rendered-from-rich-grid]',
          // Chips
          `yt-chip-cloud-chip-renderer:has(> #chip-container > yt-formatted-string[title="${getString('SHORTS')}"])`,
          // List shelf (except History, so watched Shorts can be removed)
          'ytd-browse:not([page-subtype="history"]) ytd-reel-shelf-renderer',
          'ytd-search ytd-reel-shelf-renderer',
          'ytd-search grid-shelf-view-model',
          // List item (except History, so watched Shorts can be removed)
          'ytd-browse:not([page-subtype="history"]) ytd-video-renderer:has(a[href^="/shorts"])',
          'ytd-search ytd-video-renderer:has(a[href^="/shorts"])',
          // Under video
          '#structured-description ytd-reel-shelf-renderer',
          // Related
          '#related ytd-reel-shelf-renderer',
          '#related ytd-compact-video-renderer:has(a[href^="/shorts"])',
        )
      }
      if (mobile) {
        hideCssSelectors.push(
          // Bottom nav item
          'ytm-pivot-bar-item-renderer:has(> div.pivot-shorts)',
          // Home shelf
          'ytm-rich-section-renderer:has(ytm-reel-shelf-renderer)',
          'ytm-rich-section-renderer:has(ytm-shorts-lockup-view-model)',
          // Subscriptions shelf
          '.tab-content[tab-identifier="FEsubscriptions"] ytm-item-section-renderer:has(ytm-reel-shelf-renderer)',
          // Search shelf
          'ytm-search lazy-list > ytm-reel-shelf-renderer',
          // Search
          'ytm-search ytm-video-with-context-renderer:has(a[href^="/shorts"])',
          // Under video
          'ytm-structured-description-content-renderer ytm-reel-shelf-renderer',
          // Related
          'ytm-item-section-renderer[section-identifier="related-items"] ytm-video-with-context-renderer:has(a[href^="/shorts"])',
        )
      }
    }

    if (config.hideShortsSuggestedActions) {
      hideCssSelectors.push('yt-shorts-suggested-action-view-model')
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
          'ytd-search-pyv-renderer.ytd-item-section-renderer',
          'ytd-ad-slot-renderer.ytd-item-section-renderer',
          // When an ad is playing
          'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-ads"]',
          // Suggestd action buttons in player overlay
          '#movie_player .ytp-suggested-action',
          // Panels linked to those buttons
          '#below #panels',
          // After an ad
          '.ytp-ad-action-interstitial',
          // Paid content overlay
          '.ytp-paid-content-overlay',
          // Paid content overlay in video previews
          'ytm-paid-content-overlay-renderer',
          // Above Related
          '#player-ads',
          // Related
          '#items > ytd-ad-slot-renderer',
        )
      }
      if (mobile) {
        hideCssSelectors.push(
          // Big promo on Home screen
          'ytm-statement-banner-renderer',
          // Home
          'ytm-rich-item-renderer:has(> ad-slot-renderer)',
          // Bottom of screen promo
          '.mealbar-promo-renderer',
          // Search results
          'ytm-search ytm-item-section-renderer:has(> lazy-list > ad-slot-renderer)',
          // Paid content overlay
          'ytm-paid-content-overlay-renderer',
          // Directly under video
          'ytm-companion-slot:has(> ytm-companion-ad-renderer)',
          // Item sections which contain nothing but an ad
          'ytm-item-section-renderer:has(> lazy-list > ad-slot-renderer:only-child)',
          // Related (wide)
          'ytm-item-section-renderer[section-identifier="related-items"] > lazy-list > ad-slot-renderer',
        )
      }
    }

    if (config.hideStreamed) {
      if (debugManualHiding) {
        cssRules.push(`.${Classes.HIDE_STREAMED} { outline: 2px solid blue; }`)
      } else {
        hideCssSelectors.push(`.${Classes.HIDE_STREAMED}`)
      }
    }

    if (config.hideSuggestedSections) {
      if (desktop) {
        hideCssSelectors.push(
          // Shelves in Home
          'ytd-browse[page-subtype="home"] ytd-rich-section-renderer:not(:has(> #content > ytd-rich-shelf-renderer[is-shorts]))',
          // Looking for something different? tile in Home
          'ytd-browse[page-subtype="home"] ytd-rich-item-renderer:has(> #content > ytd-feed-nudge-renderer)',
          // Suggested content shelves in Search
          `ytd-search #contents.ytd-item-section-renderer > ytd-shelf-renderer`,
          // People also search for in Search
          'ytd-search #contents.ytd-item-section-renderer > ytd-horizontal-card-list-renderer',
          // Recommended videos in a Playlist
          'ytd-browse[page-subtype="playlist"] ytd-item-section-renderer[is-playlist-video-container]',
          // Recommended playlists in a Playlist
          'ytd-browse[page-subtype="playlist"] ytd-item-section-renderer[is-playlist-video-container] + ytd-item-section-renderer',
        )
      }
      if (mobile) {
        if (loggedIn) {
          hideCssSelectors.push(
            // Shelves in Home
            '.tab-content[tab-identifier="FEwhat_to_watch"] ytm-rich-section-renderer',
            // Looking for something different? tile in Home
            'ytm-rich-item-renderer:has(> .feed-nudge-wrapper)',
          )
        } else {
          // Logged-out users can get "Try searching to get started" Home page
          // sections we don't want to hide.
          hideCssSelectors.push(
            // Shelves in Home
            '.tab-content[tab-identifier="FEwhat_to_watch"] ytm-rich-section-renderer:not(:has(ytm-search-bar-entry-point-view-model, ytm-feed-nudge-renderer))',
          )
        }
      }
    }

    if (config.hideUpcoming) {
      if (desktop) {
        hideCssSelectors.push(
          // Grid item
          'ytd-browse:not([page-subtype="channels"]) ytd-rich-item-renderer:has(ytd-thumbnail-overlay-time-status-renderer[overlay-style="UPCOMING"])',
          // Grid item in Home with "Notify Me" button
          'ytd-browse[page-subtype="home"] ytd-rich-item-renderer:has(lockup-attachments-view-model)',
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
        hideCssSelectors.push(
          // Outside of Search
          '.ytSearchboxComponentVoiceSearchWrapper',
          // Search
          '.mobile-topbar-header-voice-search-button',
          // Logged out home page
          '.search-bar-entry-point-voice-search-button',
        )
      }
    }

    if (config.hideWatched) {
      if (debugManualHiding) {
        cssRules.push(`.${Classes.HIDE_WATCHED} { outline: 2px solid green; }`)
      } else {
        hideCssSelectors.push(`.${Classes.HIDE_WATCHED}`)
      }
    }

    //#region Desktop-only
    if (desktop) {
      // Fix spaces & gaps caused by left gutter margin on first column items
      cssRules.push(`
        /* Remove left gutter margin from first column items */
        ytd-browse:is([page-subtype="home"], [page-subtype="subscriptions"], [page-subtype="channels"]) ytd-rich-item-renderer[rendered-from-rich-grid][is-in-first-column] {
          margin-left: calc(var(--ytd-rich-grid-item-margin, 16px) / 2) !important;
        }
        /* Apply the left gutter as padding in the grid contents instead */
        ytd-browse:is([page-subtype="home"], [page-subtype="subscriptions"], [page-subtype="channels"]) #contents.ytd-rich-grid-renderer {
          padding-left: calc(var(--ytd-rich-grid-gutter-margin, 16px) * 2) !important;
        }
        /* Adjust non-grid items so they don't double the gutter */
        ytd-browse:is([page-subtype="home"], [page-subtype="subscriptions"]) #contents.ytd-rich-grid-renderer > :not(ytd-rich-item-renderer) {
          margin-left: calc(var(--ytd-rich-grid-gutter-margin, 16px) * -1) !important;
        }
      `)
      if (!config.addTakeSnapshot) {
        hideCssSelectors.push('#cpfyt-snaphot-menu-item')
      }
      if (config.fullSizeTheaterMode) {
        // TODO Observe current theater mode state to get rid of these :has()
        if (config.fullSizeTheaterModeHideHeader) {
          cssRules.push(`
            /* Hide header */
            #content.ytd-app:has(> #page-manager > ytd-watch-flexy[role="main"][theater]:not([fullscreen])) #masthead-container #masthead {
              transform: translateY(-100%);
              transition: transform .15s ease-in !important;
            }
            /* Slide out after a short delay on hover */
            #content.ytd-app:has(> #page-manager > ytd-watch-flexy[role="main"][theater]:not([fullscreen])) #masthead-container:hover #masthead {
              transform: translateY(0);
              transition: transform .3s ease-out .35s !important;
            }
            /* Appear instantly when focused (e.g. press / to search) */
            #content.ytd-app:has(> #page-manager > ytd-watch-flexy[role="main"][theater]:not([fullscreen])) #masthead-container:focus-within #masthead {
              transform: translateY(0);
              transition: none !important;
            }
            /* Reclaim header space */
            #content.ytd-app:has(> #page-manager > ytd-watch-flexy[role="main"][theater]:not([fullscreen])) #page-manager {
              margin-top: 0 !important;
            }
            /* Make theater mode full view height */
            ytd-watch-flexy[theater]:not([fullscreen]) #full-bleed-container.ytd-watch-flexy {
              max-height: none;
              height: 100vh;
            }
          `)
        } else {
          // 56px is the height of #container.ytd-masthead
          cssRules.push(`
            ytd-watch-flexy[theater]:not([fullscreen]) #full-bleed-container {
              max-height: calc(100vh - 56px);
            }
          `)
        }
        if (config.fullSizeTheaterModeHideScrollbar) {
          cssRules.push(`
            html:has(#page-manager > ytd-watch-flexy[role="main"][theater]:not([fullscreen])) {
              scrollbar-width: none;
            }
          `)
        }
      }
      if (config.hideChat) {
        hideCssSelectors.push(
          // Live chat / Chat replay
          '#chat-container',
          // "Live chat replay" panel in video metadata
          '#teaser-carousel.ytd-watch-metadata',
          // Chat panel in theater mode
          '#full-bleed-container.ytd-watch-flexy #panels-full-bleed-container.ytd-watch-flexy',
        )
      }
      if (config.hideEndCards) {
        hideCssSelectors.push('#movie_player .ytp-ce-element')
      }
      if (config.hideEndVideos) {
        hideCssSelectors.push(
          '#movie_player .ytp-endscreen-content',
          '#movie_player .ytp-endscreen-previous',
          '#movie_player .ytp-endscreen-next',
        )
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
      if (config.hideMiniplayerButton) {
        hideCssSelectors.push('#movie_player .ytp-miniplayer-button')
      }
      if (config.hideShortsMetadataUntilHover) {
        cssRules.push(`
          ytd-reel-player-overlay-renderer > .metadata-container {
            opacity: 0;
            transition: opacity .25s cubic-bezier(0,0,.2,1);
          }
          #reel-video-renderer:hover ytd-reel-player-overlay-renderer > .metadata-container {
            opacity: 100;
            transition: opacity .1s cubic-bezier(.4,0,1,1);
          }
        `)
      }
      if (config.hideShortsRemixButton) {
        hideCssSelectors.push('#remix-button.ytd-reel-player-overlay-renderer')
      }
      if (config.hideSubscriptionsLatestBar) {
        hideCssSelectors.push(
          'ytd-browse[page-subtype="subscriptions"] ytd-rich-grid-renderer > #contents > ytd-rich-section-renderer:first-child'
        )
      }
      if (config.minimumGridItemsPerRow != 'auto') {
        let gridItemsPerRow = Number(config.minimumGridItemsPerRow)
        // Don't override the number of items if YouTube wants to show more
        let exclude = []
        for (let i = 6; i > gridItemsPerRow; i--) {
          exclude.push(`[elements-per-row="${i}"]`)
        }
        cssRules.push(`
          ytd-browse:is([page-subtype="home"], [page-subtype="subscriptions"]) ytd-rich-grid-renderer${exclude.length > 0 ? `:not(${exclude.join(', ')})` : ''} {
            --ytd-rich-grid-items-per-row: ${gridItemsPerRow} !important;
          }
        `)
      }
      if (!config.hideShorts && config.minimumShortsPerRow != 'auto') {
        let shortsPerRow = Number(config.minimumShortsPerRow)
        let subscriptionsShortsPerRow = Math.min(6, shortsPerRow)
        // Don't override the number of items if YouTube wants to show more
        let exclude = []
        for (let i = 6; i > shortsPerRow; i--) {
          exclude.push(`[style*="--ytd-rich-grid-items-per-row: ${i}"]`)
        }
        let excludeSelector = exclude.length > 0 ? `:not(${exclude.join(', ')})` : ''
        cssRules.push(`
          ytd-browse[page-subtype="home"] ytd-rich-shelf-renderer[is-shorts]${excludeSelector},
          ytd-browse[page-subtype="filteredsubscriptions"] ytd-rich-grid-renderer[is-shorts-grid]${excludeSelector} {
            --ytd-rich-grid-slim-items-per-row: ${shortsPerRow} !important;
            --ytd-rich-grid-items-per-row: ${shortsPerRow} !important;
          }
          ytd-browse[page-subtype="subscriptions"] ytd-rich-shelf-renderer[is-shorts]${excludeSelector} {
            --ytd-rich-grid-slim-items-per-row: ${subscriptionsShortsPerRow} !important;
            --ytd-rich-grid-items-per-row: ${subscriptionsShortsPerRow} !important;
          }
          /* Show Shorts beyond the ones YouTube thinks should be visible */
          ytd-browse[page-subtype="home"] ytd-rich-item-renderer[is-slim-media]:nth-child(-n+${shortsPerRow}),
          ytd-browse[page-subtype="subscriptions"] ytd-rich-item-renderer[is-slim-media]:nth-child(-n+${subscriptionsShortsPerRow}) {
            display: block !important;
          }
        `)
        if (shortsPerRow >= 6) {
          // Hide the Show more/Show less button if we're showing everything
          hideCssSelectors.push('ytd-browse[page-subtype="subscriptions"] ytd-rich-shelf-renderer[is-shorts] .expand-collapse-button')
        }
      }
      if (config.removePink) {
        cssRules.push(`
          .ytp-play-progress,
          #progress.ytd-thumbnail-overlay-resume-playback-renderer,
          .ytThumbnailOverlayProgressBarHostWatchedProgressBarSegment,
          .ytChapteredProgressBarChapteredPlayerBarChapterSeen,
          .ytChapteredProgressBarChapteredPlayerBarFill,
          .ytProgressBarLineProgressBarPlayed,
          #progress.yt-page-navigation-progress,
          .progress-bar-played.ytd-progress-bar-line {
            background: #f03 !important;
          }
        `)
      }
      if (config.searchThumbnailSize != 'large') {
        cssRules.push(`
          ytd-search ytd-video-renderer ytd-thumbnail.ytd-video-renderer,
          ytd-search yt-lockup-view-model .yt-lockup-view-model__content-image {
            max-width: ${{
              medium: 420,
              small: 360,
            }[config.searchThumbnailSize]}px !important;
          }
        `)
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
          `ytm-menu-item.${Classes.HIDE_OPEN_APP}`,
          // The last item in the full screen menu is Open App
          '#menu .multi-page-menu-system-link-list:has(+ ytm-privacy-tos-footer-renderer)',
        )
        if (!config.redirectShorts) {
          hideCssSelectors.push(
            // Open in App menu item in Shorts
            'ytm-menu-navigation-item-renderer:has(path[d="M21 21H3V3h9v1H4v16h16v-8h1v9zM15 3v1h4.32l-8.03 8.03.71.71 8-8V9h1V3h-6z"])',
          )
        }
      }
      if (config.hideSubscriptionsChannelList) {
        // Channel list at top of Subscriptions
        hideCssSelectors.push('.tab-content[tab-identifier="FEsubscriptions"] ytm-channel-list-sub-menu-renderer')
      }
      if (config.mobileGridView) {
        // Based on the Home grid layout
        // Subscriptions
        cssRules.push(`
          @media (min-width: 550px) and (orientation: portrait) {
            .tab-content[tab-identifier="FEsubscriptions"] ytm-section-list-renderer {
              margin: 0 16px;
            }
            .tab-content[tab-identifier="FEsubscriptions"] ytm-section-list-renderer > lazy-list {
              margin: 16px -8px 0 -8px;
            }
            .tab-content[tab-identifier="FEsubscriptions"] ytm-item-section-renderer {
              width: calc(50% - 16px);
              display: inline-block;
              vertical-align: top;
              border-bottom: none !important;
              margin-bottom: 16px;
              margin-left: 8px;
              margin-right: 8px;
            }
            .tab-content[tab-identifier="FEsubscriptions"] lazy-list ytm-media-item {
              margin-top: 0 !important;
              padding: 0 !important;
            }
            /* Fix shorts if they're not being hidden */
            .tab-content[tab-identifier="FEsubscriptions"] ytm-item-section-renderer:has(ytm-reel-shelf-renderer) {
              width: calc(100% - 16px);
              display: block;
            }
            .tab-content[tab-identifier="FEsubscriptions"] ytm-item-section-renderer:has(ytm-reel-shelf-renderer) > lazy-list {
              margin-left: -16px;
              margin-right: -16px;
            }
            /* Fix the channel list bar if it's not being hidden */
            .tab-content[tab-identifier="FEsubscriptions"] ytm-channel-list-sub-menu-renderer {
              margin-left: -16px;
              margin-right: -16px;
            }
          }
          @media (min-width: 874px) and (orientation: portrait) {
            .tab-content[tab-identifier="FEsubscriptions"] ytm-item-section-renderer {
              width: calc(33.3% - 16px);
            }
          }
          /* The page will probably switch to the list view before it ever hits this */
          @media (min-width: 1160px) and (orientation: portrait) {
            .tab-content[tab-identifier="FEsubscriptions"] ytm-item-section-renderer {
              width: calc(25% - 16px);
            }
          }
        `)
        // Search
        cssRules.push(`
          @media (min-width: 550px) and (orientation: portrait) {
            ytm-search ytm-item-section-renderer {
              margin: 0 16px;
            }
            ytm-search ytm-item-section-renderer > lazy-list {
              margin: 16px -8px 0 -8px;
            }
            ytm-search .adaptive-feed-item {
              width: calc(50% - 16px);
              display: inline-block;
              vertical-align: top;
              border-bottom: none !important;
              margin-bottom: 16px;
              margin-left: 8px;
              margin-right: 8px;
            }
            ytm-search lazy-list ytm-media-item {
              margin-top: 0 !important;
              padding: 0 !important;
            }
          }
          @media (min-width: 874px) and (orientation: portrait) {
            ytm-search .adaptive-feed-item {
              width: calc(33.3% - 16px);
            }
          }
          @media (min-width: 1160px) and (orientation: portrait) {
            ytm-search .adaptive-feed-item {
              width: calc(25% - 16px);
            }
          }
        `)
      }
      if (config.removePink) {
        cssRules.push(`
          .ytp-play-progress,
          .thumbnail-overlay-resume-playback-progress,
          .ytChapteredProgressBarChapteredPlayerBarChapterSeen,
          .ytChapteredProgressBarChapteredPlayerBarFill,
          .ytProgressBarLineProgressBarPlayed,
          .ytThumbnailOverlayProgressBarHostWatchedProgressBarSegment {
            background: #f03 !important;
          }
        `)
      }
    }
    //#endregion

    if (hideCssSelectors.length > 0) {
      let hideCssRule = `${hideCssSelectors.join(',\n')} { display: none !important; }`
      if (desktop) hideCssRule = `ytd-app { ${hideCssRule} }`
      cssRules.push(hideCssRule)
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

function isChannelPage() {
  return URL_CHANNEL_RE.test(location.pathname)
}

function isSearchPage() {
  return location.pathname == '/results'
}

function isShortsPage() {
  return location.pathname.startsWith('/shorts/')
}

function isSubscriptionsPage() {
  return location.pathname == '/feed/subscriptions'
}

function isVideoPage() {
  return location.pathname == '/watch'
}

//#region Tweak functions
function allowBackgroundPlay() {
  realDocumentHidden = document.hidden
  Object.defineProperties(document, {
    hidden: {value: false},
    visibilityState: {value: 'visible'},
  })
  let activityTimeout = null
  document.addEventListener('visibilitychange', async (e) => {
    e.stopImmediatePropagation()
    realDocumentHidden = !realDocumentHidden
    if (!realDocumentHidden) {
      if (activityTimeout) {
        log('allowBackgroundPlay: stopping activity simulation')
        clearTimeout(activityTimeout)
        activityTimeout = null
      }
      return
    }
    if (!isVideoPage()) return
    let $player = document.querySelector('#movie_player')
    if (!$player) return
    // @ts-ignore
    let playerState = $player.getPlayerState?.()
    if (!playerState || playerState < 1 || playerState == 2) return
    function activity() {
      if (!realDocumentHidden) return
      let keyCode = [16, 17, 18][Math.floor(Math.random() * 3)]
      for (let type of ['keydown', 'keyup']) {
        document.dispatchEvent(new KeyboardEvent(type, {
          bubbles: true,
          cancelable: true,
          keyCode,
          which: keyCode,
        }))
      }
      activityTimeout = setTimeout(activity, 45_000 + Math.random() * 25_000)
    }
    log('allowBackgroundPlay: starting activity simulation')
    activity()
  }, true)
}

async function alwaysUseOriginalAudio() {
  let $player = await getElement('#movie_player', {
    name: 'player (alwaysUseOriginalAudio)',
    stopIf: currentUrlChanges(),
  })
  if (!$player) return

  // @ts-ignore
  let playerState = $player.getPlayerState?.()
  if (playerState != null && playerState != 1) {
    log('alwaysUseOriginalAudio: waiting for video to start playing')
    await new Promise((resolve) => {
      function onStateChange(playerState) {
        if (playerState == 1) {
          log('alwaysUseOriginalAudio: video started playing')
          $player.removeEventListener('onStateChange', onStateChange)
          resolve()
        }
      }
      $player.addEventListener('onStateChange', onStateChange)
    })
  }
  // @ts-ignore
  let tracks = $player?.getAvailableAudioTracks?.()
  if (!tracks || tracks.length <= 1) {
    log('alwaysUseOriginalAudio: no alternative tracks available')
    return
  }

  let originalTrackName
  let originalTrack = tracks.find((track) => {
    for (let prop in track) {
      if (Object.prototype.toString.call(track[prop]) == '[object Object]' &&
          track[prop].id &&
          track[prop].name &&
          track[prop].name.includes(getString('ORIGINAL'))) {
        originalTrackName = track[prop].name
        return true
      }
    }
  })
  if (!originalTrack) {
    warn('alwaysUseOriginalAudio: could not find original track', tracks)
    return
  }

  // @ts-ignore
  let activeTrack = $player.getAudioTrack?.()
  if (activeTrack && activeTrack.id == originalTrack.id) {
    log('alwaysUseOriginalAudio: already using original track')
    return
  }

  log('alwaysUseOriginalAudio: switching to original audio track', originalTrackName)
  // @ts-ignore
  $player.setAudioTrack?.(originalTrack)
}

async function alwaysUseTheaterMode() {
  let $player = await getElement('#movie_player', {
    name: 'player (alwaysUseTheaterMode)',
    stopIf: currentUrlChanges(),
  })
  if (!$player) return
  if (!$player.closest('#player-full-bleed-container')) {
    let $sizeButton = /** @type {HTMLButtonElement} */ ($player.querySelector('button.ytp-size-button'))
    if ($sizeButton) {
      log('alwaysUseTheaterMode: clicking size button')
      $sizeButton.click()
    } else {
      warn('alwaysUseTheaterMode: size button not found')
    }
  } else {
    log('alwaysUseTheaterMode: already using theater mode')
  }
}

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
      sections.push(/** @type {HTMLElement} */ ($el).innerText.trim())
    } else {
      parts.push(/** @type {HTMLElement} */ ($el.querySelector('.segment-text')).innerText.trim())
    }
  }
  if (parts.length > 0) {
    sections.push(parts.join(' '))
  }

  let $link = document.createElement('a')
  let url = URL.createObjectURL(new Blob([sections.join('\n\n')], {type: "text/plain"}))
  let title = /** @type {HTMLElement} */ (document.querySelector('#above-the-fold #title'))?.innerText ?? 'transcript'
  $link.setAttribute('href', url)
  $link.setAttribute('download', `${title}.txt`)
  $link.click()
  URL.revokeObjectURL(url)
}

function handleCurrentUrl() {
  log('handling', getCurrentUrl())
  disconnectObservers(pageObservers, 'page')

  let page = ''
  if (isHomePage()) {
    tweakHomePage()
  }
  else if (isSubscriptionsPage()) {
    tweakSubscriptionsPage()
  }
  else if (isVideoPage()) {
    tweakVideoPage()
  }
  else if (isSearchPage()) {
    tweakSearchPage()
  }
  else if (isShortsPage()) {
    tweakShortsPage()
  }
  else if (isChannelPage()) {
    page = 'channel'
    tweakChannelPage()
  }
  // Add a current page indicator to html[cpfyt-page] when we need a CSS hook
  if (mobile && document.documentElement.getAttribute('cpfyt-page') != page) {
    document.documentElement.setAttribute('cpfyt-page', page)
  }

  if (location.pathname.startsWith('/shorts/')) {
    if (config.redirectShorts) {
      redirectShort()
    }
  }
}

/** @param {HTMLElement} $menu */
function addDownloadTranscriptToDesktopMenu($menu) {
  if (!isVideoPage()) return

  let $transcript = $lastClickedElement.closest('[target-id="engagement-panel-searchable-transcript"]')
  if (!$transcript) return

  if ($menu.querySelector('.cpfyt-menu-item')) return

  let $menuItems = $menu.querySelector('#items')
  $menuItems.insertAdjacentHTML('beforeend', html`
<div class="cpfyt-menu-item" tabindex="0" style="display: none">
  <div class="cpfyt-menu-text">
    ${getYtString('DOWNLOAD')}
  </div>
</div>
  `)
  let $item = $menuItems.lastElementChild
  function download() {
    downloadTranscript()
    // Dismiss the menu
    // @ts-ignore
    document.querySelector('#content')?.click()
  }
  $item.addEventListener('click', download)
  $item.addEventListener('keydown', /** @param {KeyboardEvent} e */ (e) => {
    if (e.key == ' ' || e.key == 'Enter') {
      e.preventDefault()
      download()
    }
  })
}

/** @param {HTMLElement} $menu */
function handleDesktopWatchChannelMenu($menu) {
  if (!isVideoPage()) return

  let $channelMenuRenderer = $lastClickedElement.closest('ytd-menu-renderer.ytd-watch-metadata')
  if (!$channelMenuRenderer) return

  let $channelLink = /** @type {HTMLAnchorElement} */ (document.querySelector('#channel-name a'))
  if (!$channelLink) {
    warn('channel link not found in video page')
    return
  }

  let channel = {
    name: $channelLink.textContent,
    url: $channelLink.pathname,
  }
  lastClickedChannel = channel

  let $item = $menu.querySelector('#cpfyt-hide-channel-menu-item')

  function configureMenuItem(channel) {
    let hidden = isChannelHidden(channel)
    $item.querySelector('.cpfyt-menu-icon').innerHTML = /** @type {string} */ (policy.createHTML(hidden ? Svgs.RESTORE : Svgs.DELETE))
    $item.querySelector('.cpfyt-menu-text').textContent = getString(hidden ? 'UNHIDE_CHANNEL' : 'HIDE_CHANNEL')
  }

  // The same menu can be reused, so we reconfigure it if it exists. If the
  // menu item is reused, we're just changing [lastClickedChannel], which is
  // why [toggleHideChannel] uses it.
  if (!$item) {
    let hidden = isChannelHidden(channel)

    function toggleHideChannel() {
      let hidden = isChannelHidden(lastClickedChannel)
      if (hidden) {
        log('unhiding channel', lastClickedChannel)
        config.hiddenChannels = config.hiddenChannels.filter((hiddenChannel) =>
          hiddenChannel.url ? lastClickedChannel.url != hiddenChannel.url : hiddenChannel.name != lastClickedChannel.name
        )
      } else {
        log('hiding channel', lastClickedChannel)
        config.hiddenChannels.unshift(lastClickedChannel)
      }
      configureMenuItem(lastClickedChannel)
      storeConfigChanges({hiddenChannels: config.hiddenChannels})
      configureCss()
      handleCurrentUrl()
      // Dismiss the menu
      let $popupContainer = /** @type {HTMLElement} */ ($menu.closest('ytd-popup-container'))
      $popupContainer.click()
      // XXX Menu isn't dismissing on iPad Safari
      if ($menu.style.display != 'none') {
        $menu.style.display = 'none'
        $menu.setAttribute('aria-hidden', 'true')
      }
    }

    let $menuItems = $menu.querySelector('#items')
    $menuItems.insertAdjacentHTML('beforeend', html`
<div class="cpfyt-menu-item" tabindex="0" id="cpfyt-hide-channel-menu-item" style="display: none">
  <div class="cpfyt-menu-icon">
    ${hidden ? Svgs.RESTORE : Svgs.DELETE}
  </div>
  <div class="cpfyt-menu-text">
    ${getString(hidden ? 'UNHIDE_CHANNEL' : 'HIDE_CHANNEL')}
  </div>
</div>
    `)
    $item = $menuItems.lastElementChild
    $item.addEventListener('click', toggleHideChannel)
    $item.addEventListener('keydown', /** @param {KeyboardEvent} e */ (e) => {
      if (e.key == ' ' || e.key == 'Enter') {
        e.preventDefault()
        toggleHideChannel()
      }
    })
  } else {
    configureMenuItem(channel)
  }
}

/** @param {HTMLElement} $menu */
function addHideChannelToDesktopVideoMenu($menu) {
  let videoContainerElementSelector
  if (isSearchPage()) {
    videoContainerElementSelector = 'ytd-video-renderer'
  }
  else if (isVideoPage()) {
    // TODO Remove ytd-compact-video-renderer after confirming all Related videos have moved to yt-lockup-view-model
    videoContainerElementSelector = 'ytd-compact-video-renderer, yt-lockup-view-model'
  }
  else if (isHomePage()) {
    videoContainerElementSelector = 'ytd-rich-item-renderer, yt-lockup-view-model'
  }

  if (!videoContainerElementSelector) return

  let $video = /** @type {HTMLElement} */ ($lastClickedElement.closest(videoContainerElementSelector))
  if (!$video) return

  log('found clicked video')
  let channel = getChannelDetailsFromVideo($video)
  if (!channel) return
  lastClickedChannel = channel
  log('channel for clicked video', lastClickedChannel)

  $menu.querySelector('#cpfyt-hide-channel-menu-item')?.remove()

  let $menuItems = $menu.querySelector([
    'tp-yt-paper-listbox',
    'yt-list-view-model',
  ].join(', '))
  // Insert before last menu item, which should be Report
  $menuItems.lastElementChild.insertAdjacentHTML('beforebegin', html`
<div class="cpfyt-menu-item" tabindex="0" id="cpfyt-hide-channel-menu-item" style="display: none">
  <div class="cpfyt-menu-icon">
    ${Svgs.DELETE}
  </div>
  <div class="cpfyt-menu-text">
    ${getString('HIDE_CHANNEL')}
  </div>
</div>
  `)
  let $item = $menuItems.querySelector('#cpfyt-hide-channel-menu-item')
  function hideChannel() {
    log('hiding channel', lastClickedChannel)
    config.hiddenChannels.unshift(lastClickedChannel)
    storeConfigChanges({hiddenChannels: config.hiddenChannels})
    configureCss()
    handleCurrentUrl()
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

/** @param {HTMLElement} $menu */
async function addHideChannelToMobileVideoMenu($menu) {
  if (!(isHomePage() || isSearchPage() || isVideoPage())) return

  /** @type {HTMLElement} */
  let $video = $lastClickedElement.closest('ytm-video-with-context-renderer')
  if (!$video) return

  log('found clicked video')
  let channel = getChannelDetailsFromVideo($video)
  if (!channel) return
  lastClickedChannel = channel

  let $menuItems = $menu.querySelector($menu.id == 'menu' ? '.menu-content' : '.bottom-sheet-media-menu-item')
  let hasIcon = Boolean($menuItems.querySelector('c3-icon'))
  let hideChannelMenuItemHTML = html`
    <ytm-menu-item id="cpfyt-hide-channel-menu-item">
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
  `
  let $cancelMenuItem = $menu.querySelector('ytm-menu-item:has(.menu-cancel-button')
  if ($cancelMenuItem) {
    $cancelMenuItem.insertAdjacentHTML('beforebegin', hideChannelMenuItemHTML)
  } else {
    $menuItems.insertAdjacentHTML('beforeend', hideChannelMenuItemHTML)
  }
  let $button = $menuItems.querySelector('#cpfyt-hide-channel-menu-item button')
  $button.addEventListener('click', () => {
    log('hiding channel', lastClickedChannel)
    config.hiddenChannels.unshift(lastClickedChannel)
    storeConfigChanges({hiddenChannels: config.hiddenChannels})
    configureCss()
    handleCurrentUrl()
  })
}

/**
 * @param {Element} $video video container element
 * @returns {import("./types").Channel}
 */
function getChannelDetailsFromVideo($video) {
  if (desktop) {
    if ($video.tagName == 'YTD-RICH-ITEM-RENDERER') {
      let $link = /** @type {HTMLAnchorElement} */ ($video.querySelector('#text.ytd-channel-name a'))
      if ($link) {
        return {
          name: $link.textContent,
          url: $link.pathname,
        }
      }
      // Home nests a yt-lockup-view-model inside - fall back to checking it
      $video = $video.querySelector('yt-lockup-view-model')
      if (!$video) return
    }

    if ($video.tagName == 'YTD-VIDEO-RENDERER') {
      let $link = /** @type {HTMLAnchorElement} */ ($video.querySelector('#text.ytd-channel-name a'))
      if ($link) {
        return {
          name: $link.textContent,
          url: $link.pathname,
        }
      }
    }
    else if ($video.tagName == 'YT-LOCKUP-VIEW-MODEL') {
      // Home videos have a channel link
      let $link = /** @type {HTMLAnchorElement} */ ($video.querySelector('yt-content-metadata-view-model a'))
      if ($link) {
        return {
          name: $link.textContent,
          url: $link.pathname,
        }
      }
      // Assumption: channel name is always the first text in this element
      let $name = $video.querySelector('yt-content-metadata-view-model [role="text"]')
      if ($name) {
        return {
          name: $name.textContent,
        }
      }
    }
    // TODO Remove after confirming all Related videos have moved to yt-lockup-view-model
    else if ($video.tagName == 'YTD-COMPACT-VIDEO-RENDERER') {
      let $link = /** @type {HTMLElement} */ ($video.querySelector('#text.ytd-channel-name'))
      if ($link) {
        return {
          name: $link.getAttribute('title')
        }
      }
    }
  }
  if (mobile) {
    let $thumbnailLink =/** @type {HTMLAnchorElement} */ ($video.querySelector('ytm-channel-thumbnail-with-link-renderer > a'))
    let $name = /** @type {HTMLElement} */ ($video.querySelector('ytm-badge-and-byline-renderer .yt-core-attributed-string'))
    if ($name) {
      return {
        name: $name.textContent,
        url: $thumbnailLink?.pathname,
      }
    }
  }
  // warn('unable to get channel details from video container', $video)
}

async function observeDesktopEndscreenVideos() {
  let $endscreenContent = await getElement('.ytp-endscreen-content', {
    name: 'endscreen content',
    stopIf: currentUrlChanges(),
  })
  if (!$endscreenContent) return

  /** @type {import("./types").Disconnectable} */
  let firstItemObserver

  function processItems() {
    for (let $item of $endscreenContent.children) {
      let $channelInfo = /** @type {HTMLElement} */ ($item.querySelector('.ytp-videowall-still-info-author'))
      let name = $channelInfo?.innerText?.split('•')?.[0]?.trim()
      $item.classList.toggle(Classes.HIDE_CHANNEL, isChannelHidden({name}))
    }
  }

  observeElement($endscreenContent, () => {
    processItems()
    if (!firstItemObserver && $endscreenContent.firstElementChild) {
      firstItemObserver = observeElement($endscreenContent.firstElementChild, () => {
        processItems()
      }, {
        name: 'endscreen item changes',
        observers: pageObservers,
      }, {
        attributes: true,
        attributeFilter: ['href'],
      })
    }
    else if (firstItemObserver && $endscreenContent.childElementCount == 0) {
      firstItemObserver?.disconnect()
      firstItemObserver = null
    }
  }, {
    name: 'endscreen content',
    observers: pageObservers,
    leading: true,
  })
}

/**
 * If you navigate back to Subscriptions after a period of time, its contents
 * will be refreshed, reusing elements. We need to detect this and re-apply
 * manual hiding preferences for the updated video in each element.
 * @param {Element} $gridItem
 * @param {string} uniqueId
 */
function observeDesktopRichGridMediaItemContent($gridItem, uniqueId) {
  observeDesktopRichGridMediaProgress($gridItem, uniqueId)

  // For videos, observe the thumbnail link for the videoId being changed
  let thumbnailSelector = 'ytd-rich-grid-media a#thumbnail'
  let $thumbnailLink = /** @type {HTMLAnchorElement} */ ($gridItem.querySelector(thumbnailSelector))
  /** @type {import("./types").CustomMutationObserver} */
  let thumbnailObserver

  function observeThumbnail() {
    if (!$thumbnailLink) {
      log(`${uniqueId} has no video thumbnail link`)
      return
    }
    thumbnailObserver = observeElement($thumbnailLink, (mutations) => {
      let searchParams = new URLSearchParams($thumbnailLink.search)
      if (searchParams.has('v') && !mutations[0].oldValue.includes(searchParams.get('v'))) {
        log(`${uniqueId} thumbnail link href changed`, mutations[0].oldValue, '→', $thumbnailLink.href)
        manuallyHideVideo($gridItem)
      }
    }, {
      name: `${uniqueId} thumbnail link href`,
      observers: pageObservers,
    }, {
      attributes: true,
      attributeFilter: ['href'],
      attributeOldValue: true,
    })
  }

  if ($thumbnailLink) {
    observeThumbnail()
  }

  // Observe the content of the grid item for a video being added or removed
  // when grid contents are refreshed.
  let $content = $gridItem.querySelector(':scope > #content')
  observeElement($content, (mutations) => {
    for (let mutation of mutations) {
      for (let $addedNode of mutation.addedNodes) {
        if (!($addedNode instanceof HTMLElement)) continue
        if ($addedNode.nodeName == 'YTD-RICH-GRID-MEDIA') {
          log('ytd-rich-grid-media added to', uniqueId, $addedNode)
          $thumbnailLink = /** @type {HTMLAnchorElement} */ ($gridItem.querySelector(thumbnailSelector))
          observeThumbnail()
          manuallyHideVideo($gridItem)
          if (config.hideWatched) {
            observeDesktopRichGridMediaProgress($gridItem, uniqueId)
          }
        }
      }
      for (let $removedNode of mutation.removedNodes) {
        if (!($removedNode instanceof HTMLElement)) continue
        if ($removedNode.nodeName == 'YTD-RICH-GRID-MEDIA') {
          log(uniqueId, 'ytd-rich-grid-media removed from grid item')
          $thumbnailLink = null
          thumbnailObserver?.disconnect()
          manuallyHideVideo($gridItem)
        }
      }
    }
  }, {
    name: `${uniqueId} #content`,
    observers: pageObservers,
  })
}

/**
 * If you navigate back to Home after a period of time or use the categories
 * pills, grid item contents are re-rendered. We need to re-apply manual hiding
 * when this happens.
 *
 * yt-lockup-view-model seems to be re-rendered from scratch, even if the same
 * video will end up in the same grid item. The element also seems to be empty
 * on initial render.
 * @param {Element} $gridItem
 * @param {string} uniqueId
 */
function observeDesktopYtLockupViewModelItemContent($gridItem, uniqueId) {
  let $content = $gridItem.querySelector(':scope > #content')
  observeElement($content, (mutations) => {
    for (let mutation of mutations) {
      for (let $addedNode of mutation.addedNodes) {
        if (!($addedNode instanceof HTMLElement)) continue
        if ($addedNode.nodeName == 'YT-LOCKUP-VIEW-MODEL') {
          log('yt-lockup-view-model added to', uniqueId, $addedNode)
          // Let the new thumbnail finish rendering
          requestAnimationFrame(() => manuallyHideVideo($gridItem, {hideDismissed: true}))
        }
      }
    }
  }, {
    name: `${uniqueId} #content`,
    observers: pageObservers,
  })
}

/**
 * If you watch a video then navigate back to Subscriptions without causing its
 * contents to be refreshed, its watch progress will be updated in-place.
 * @param {Element} $video
 * @param {string} uniqueId
 */
function observeDesktopRichGridMediaProgress($video, uniqueId) {
  let $overlays = $video.querySelector('ytd-rich-grid-media #overlays')
  if (!$overlays) {
    log(uniqueId, 'has no video #overlay')
    return
  }

  let $progress = $overlays.querySelector('#progress')
  /** @type {import("./types").CustomMutationObserver} */
  let progressObserver

  function observeProgress() {
    if (!$progress) {
      log(`${uniqueId} has no #progress`)
      return
    }
    progressObserver = observeElement($progress, (mutations) => {
      if (mutations.length > 0) {
        log(`${uniqueId} #progress style changed`)
        hideWatched($video)
      }
    }, {
      name: `${uniqueId} #progress (for style changes)`,
      observers: pageObservers,
    }, {
      attributes: true,
      attributeFilter: ['style'],
    })
  }

  if ($progress) {
    observeProgress()
  }

  // Observe overlay contents for a progress bar being added or removed when
  // the video is updated.
  observeElement($overlays, (mutations) => {
    for (let mutation of mutations) {
      for (let $addedNode of mutation.addedNodes) {
        if (!($addedNode instanceof HTMLElement)) continue
        if ($addedNode.nodeName == 'YTD-THUMBNAIL-OVERLAY-RESUME-PLAYBACK-RENDERER') {
          $progress = $addedNode.querySelector('#progress')
          observeProgress()
          hideWatched($video)
        }
      }
      for (let $removedNode of mutation.removedNodes) {
        if (!($removedNode instanceof HTMLElement)) continue
        if ($removedNode.nodeName == 'YTD-THUMBNAIL-OVERLAY-RESUME-PLAYBACK-RENDERER') {
          $progress = null
          progressObserver?.disconnect()
          hideWatched($video)
        }
      }
    }
  }, {
    name: `${uniqueId} #overlays (for #progress being added or removed)`,
    observers: pageObservers,
  })
}

/** @param {{page: 'home' | 'subscriptions'}} options */
async function observeDesktopRichGridItems(options) {
  let {page} = options
  let itemCount = 0

  let $renderer = await getElement(`ytd-browse[page-subtype="${page}"] ytd-rich-grid-renderer`, {
    name: `${page} <ytd-rich-grid-renderer>`,
    stopIf: currentUrlChanges(),
  })
  if (!$renderer) return

  let $gridContents = $renderer.querySelector(':scope > #contents')

  /**
   * @param {Element} $gridItem
   * @param {string} $gridItem
   */
  function processGridItem($gridItem, uniqueId) {
    manuallyHideVideo($gridItem, {hideDismissed: page === 'home'})
    if (page == 'home') observeDesktopYtLockupViewModelItemContent($gridItem, uniqueId)
    if (page == 'subscriptions') observeDesktopRichGridMediaItemContent($gridItem, uniqueId)
  }

  function processAllVideos() {
    let $videos = $gridContents.querySelectorAll('ytd-rich-item-renderer.ytd-rich-grid-renderer')
    if ($videos.length > 0) {
      log('processing', $videos.length, `${page} video${s($videos.length)}`)
    }
    for (let $video of $videos) {
      processGridItem($video, `grid item ${++itemCount}`)
    }
  }

  // Process new videos as they're added
  observeElement($gridContents, (mutations) => {
    let videosAdded = 0
    for (let mutation of mutations) {
      for (let $addedNode of mutation.addedNodes) {
        if (!($addedNode instanceof HTMLElement)) continue
        if ($addedNode.nodeName == 'YTD-RICH-ITEM-RENDERER') {
          processGridItem($addedNode, `grid item ${++itemCount}`)
          videosAdded++
        }
      }
    }
    if (videosAdded > 0) {
      log(videosAdded, `video${s(videosAdded)} added`)
    }
  }, {
    name: `${page} <ytd-rich-grid-renderer> #contents (for new videos being added)`,
    observers: pageObservers,
  })

  processAllVideos()
}

/** @param {HTMLElement} $dropdown */
function onDesktopMenuAppeared($dropdown) {
  log('menu appeared', $dropdown)

  // YouTube currently has 2 menu components: <tp-yt-paper-listbox> and <yt-list-item-view-model>
  let $menu = $dropdown.querySelector('tp-yt-paper-listbox, yt-list-item-view-model')
  let menuConfig = MenuConfigs[$menu.tagName]

  if (config.hideShareThanksClip) {
    let $menuItems = /** @type {NodeListOf<HTMLElement>} */ ($dropdown.querySelectorAll(menuConfig.itemSelector))
    let testLabels = new Set([getString('SHARE'), getString('THANKS'), getString('CLIP')])
    for (let $menuItem of $menuItems) {
      let menuItemText = $menuItem.querySelector(menuConfig.itemTextSelector)?.textContent
      if (testLabels.has(menuItemText)) {
        log('hideShareThanksClip: tagging', menuItemText, 'menu item')
        $menuItem.classList.add(Classes.HIDE_SHARE_THANKS_CLIP)
        // Separator on the Download item is <tp-yt-paper-listbox> menu-specific
        if ($menuItem.hasAttribute('has-separator')) {
          let $newSeparatorItem = $menuItem.previousElementSibling
          if (config.hidePremiumUpsells && $newSeparatorItem.tagName == 'YTD-MENU-SERVICE-ITEM-DOWNLOAD-RENDERER') {
            $newSeparatorItem = $newSeparatorItem.previousElementSibling
          }
          log('hideShareThanksClip: moving has-separator to', $newSeparatorItem)
          $newSeparatorItem.setAttribute('has-separator', '')
        }
      }
      else if ($menuItem.classList.contains(Classes.HIDE_SHARE_THANKS_CLIP)) {
        log('hideShareThanksClip: un-tagging', menuItemText, 'menu item')
        $menuItem.classList.remove(Classes.HIDE_SHARE_THANKS_CLIP)
      }
    }
  }
  if (config.downloadTranscript) {
    addDownloadTranscriptToDesktopMenu($dropdown)
  }
  if (config.hideChannels) {
    addHideChannelToDesktopVideoMenu($dropdown)
    // XXX This menu re-renders async if another menu was previously displayed
    handleDesktopWatchChannelMenu($dropdown)
  }
  if (config.hideHiddenVideos) {
    observeVideoHiddenState()
  }
}

async function observePopups() {
  if (desktop) {
    /** @param {HTMLElement} $dialog */
    function observeDialog($dialog) {
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

    let dropdownCount = 1
    /** @param {HTMLElement} $dropdown */
    function observeDropdown($dropdown) {
      observeElement($dropdown, () => {
        if ($dropdown.getAttribute('aria-hidden') != 'true') {
          onDesktopMenuAppeared($dropdown)
        }
      }, {
        leading: true,
        name: `<tp-yt-iron-dropdown> ${dropdownCount++} (for [aria-hidden] being removed)`,
        observers: globalObservers,
      }, {
        attributes: true,
        attributeFilter: ['aria-hidden'],
      })
    }

    // Desktop dialogs and menus appear in <ytd-popup-container>. Once created,
    // the same elements are reused.
    let $popupContainer = await getElement('ytd-popup-container', {name: 'popup container'})
    let $dialog = /** @type {HTMLElement} */ ($popupContainer.querySelector('tp-yt-paper-dialog'))
    // YouTube currently has multiple dropdown styles, with one element each
    let $dropdowns = /** @type {NodeListOf<HTMLElement>} */ ($popupContainer.querySelectorAll('tp-yt-iron-dropdown'))
    if ($dialog) observeDialog($dialog)
    if ($dropdowns.length > 0) {
      for (let $dropdown of $dropdowns) {
        observeDropdown($dropdown)
      }
    }

    observeElement($popupContainer, (mutations) => {
      for (let mutation of mutations) {
        for (let $el of mutation.addedNodes) {
          if (!($el instanceof HTMLElement)) continue
          switch($el.nodeName) {
            case 'TP-YT-IRON-DROPDOWN':
              observeDropdown($el)
              break
            case 'TP-YT-PAPER-DIALOG':
              observeDialog($el)
              break
          }
        }
      }
    }, {
      name: '<ytd-popup-container> (for <tp-yt-iron-dropdown> and <tp-yt-paper-dialog> being added)',
      observers: globalObservers,
    })

    if (config.addTakeSnapshot) {
      let $contextMenu = /** @type {HTMLElement} */ ($popupContainer.querySelector('.ytp-popup.ytp-contextmenu'))

      function addTakeShapshotMenuItem() {
        let $insertAfter = $contextMenu.querySelector('.ytp-menuitem:last-child')
        $insertAfter.insertAdjacentHTML('afterend', html`
<div id="cpfyt-snaphot-menu-item" class="ytp-menuitem" role="menuitem" tabindex="0">
  <div class="ytp-menuitem-icon">
    <svg fill="#fff" height="24px" viewBox="0 -960 960 960" width="24px">
      <path d="M480-400q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0 80q66 0 113-47t47-113q0-66-47-113t-113-47q-66 0-113 47t-47 113q0 66 47 113t113 47ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h640v-480H160v480Zm0 0v-480 480Z"/>
    </svg>
  </div>
  <div class="ytp-menuitem-label">${getString('TAKE_SNAPSHOT')}</div>
  <div class="ytp-menuitem-content"></div>
</div>
        `)
        $contextMenu.querySelector('#cpfyt-snaphot-menu-item').addEventListener('click', takeSnapshot)
        // Adjust context menu height for new item
        let height = `${parseInt($contextMenu.style.height) + 40}px`
        $contextMenu.style.height = height
        if ($contextMenu.children[0]) {
          /** @type {HTMLElement} */ ($contextMenu.children[0]).style.height = height
          if ($contextMenu.children[0].children[0]) {
            /** @type {HTMLElement} */ ($contextMenu.children[0].children[0]).style.height = height
          }
        }
      }

      if ($contextMenu) {
        addTakeShapshotMenuItem()
      } else {
        // Context menu not added yet - wait for it to appear
        observeElement(document.body, (mutations, observer) => {
          for (let mutation of mutations) {
            for (let $el of mutation.addedNodes) {
              if ($el instanceof HTMLElement && $el.classList.contains('ytp-contextmenu')) {
                $contextMenu = $el
                observer.disconnect()
                addTakeShapshotMenuItem()
                return
              }
            }
          }
        }, {
          name: '<body> (for player context menu being added)',
          observers: globalObservers,
        })
      }
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
 * Search pages are a list of sections, which can have video items added to them
 * after they're added, so we watch for new section contents as well as for new
 * sections. When the search is changed, additional sections are removed and the
 * first section is refreshed - it gets a can-show-more attribute while this is
 * happening.
 * @param {{
 *   name: string
 *   selector: string
 *   sectionContentsSelector: string
 *   sectionElement: string
 *   suggestedSectionElement?: string
 *   videoElement: string
 * }} options
 */
async function observeSearchResultSections(options) {
  let {name, selector, sectionContentsSelector, sectionElement, suggestedSectionElement = null, videoElement} = options
  let sectionNodeName = sectionElement.toUpperCase()
  let suggestedSectionNodeName = suggestedSectionElement?.toUpperCase()
  let videoNodeName = videoElement.toUpperCase()

  let $sections = await getElement(selector, {
    name,
    stopIf: currentUrlChanges(),
  })
  if (!$sections) return

  /** @type {WeakMap<Element, Map<string, import("./types").Disconnectable>>} */
  let sectionObservers = new WeakMap()
  /** @type {WeakMap<Element, Map<string, import("./types").Disconnectable>>} */
  let sectionItemObservers = new WeakMap()
  let sectionCount = 0

  /**
   * @param {HTMLElement} $section
   * @param {number} sectionNum
   */
  function processSection($section, sectionNum) {
    let $contents = /** @type {HTMLElement} */ ($section.querySelector(sectionContentsSelector))
    let itemCount = 0
    let suggestedSectionCount = 0
    /** @type {Map<string, import("./types").Disconnectable>} */
    let observers = new Map()
    /** @type {Map<string, import("./types").Disconnectable>} */
    let itemObservers = new Map()
    sectionObservers.set($section, observers)
    sectionItemObservers.set($section, itemObservers)

    function processCurrentItems() {
      itemCount = 0
      suggestedSectionCount = 0
      for (let $item of $contents.children) {
        if ($item.nodeName == videoNodeName) {
          manuallyHideVideo($item)
          waitForVideoOverlay($item, `section ${sectionNum} item ${++itemCount}`, itemObservers)
        }
        if (!config.hideSuggestedSections && suggestedSectionNodeName != null && $item.nodeName == suggestedSectionNodeName) {
          processSuggestedSection($item)
        }
      }
    }

    /**
     * If suggested sections (Latest from, People also watched, For you, etc.)
     * aren't being hidden, we need to process their videos and watch for more
     * being loaded.
     * @param {Element} $suggestedSection
     */
    function processSuggestedSection($suggestedSection) {
      let suggestedItemCount = 0
      let uniqueId = `section ${sectionNum} suggested section ${++suggestedSectionCount}`
      let $items = $suggestedSection.querySelector('#items')
      for (let $video of $items.children) {
        if ($video.nodeName == videoNodeName) {
          manuallyHideVideo($video)
          waitForVideoOverlay($video, `${uniqueId} item ${++suggestedItemCount}`, itemObservers)
        }
      }
      // More videos are added if the "More" control is used
      observeElement($items, (mutations, observer) => {
        let moreVideosAdded = false
        for (let mutation of mutations) {
          for (let $addedNode of mutation.addedNodes) {
            if (!($addedNode instanceof HTMLElement)) continue
            if ($addedNode.nodeName == videoNodeName) {
              if (!moreVideosAdded) moreVideosAdded = true
              manuallyHideVideo($addedNode)
              waitForVideoOverlay($addedNode, `${uniqueId} item ${++suggestedItemCount}`, itemObservers)
            }
          }
        }
        if (moreVideosAdded) {
          observer.disconnect()
        }
      }, {
        name: `${uniqueId} videos (for more being added)`,
        observers: [itemObservers, pageObservers],
      })
    }

    if (desktop) {
      observeElement($section, () => {
        if ($section.getAttribute('can-show-more') == null) {
          log('can-show-more attribute removed - reprocessing refreshed items')
          for (let observer of itemObservers.values()) {
            observer.disconnect()
          }
          processCurrentItems()
        }
      }, {
        name: `section ${sectionNum} can-show-more attribute`,
        observers: [observers, pageObservers],
      }, {
        attributes: true,
        attributeFilter: ['can-show-more'],
      })
    }

    observeElement($contents, (mutations) => {
      for (let mutation of mutations) {
        for (let $addedNode of mutation.addedNodes) {
          if (!($addedNode instanceof HTMLElement)) continue
          if ($addedNode.nodeName == videoNodeName) {
            manuallyHideVideo($addedNode)
            waitForVideoOverlay($addedNode, `section ${sectionNum} item ${++itemCount}`, observers)
          }
          if (!config.hideSuggestedSections && suggestedSectionNodeName != null && $addedNode.nodeName == suggestedSectionNodeName) {
            processSuggestedSection($addedNode)
          }
        }
      }
    }, {
      name: `section ${sectionNum} contents`,
      observers: [observers, pageObservers],
    })

    processCurrentItems()
  }

  observeElement($sections, (mutations) => {
    for (let mutation of mutations) {
      // New sections are added when more results are loaded
      for (let $addedNode of mutation.addedNodes) {
        if (!($addedNode instanceof HTMLElement)) continue
        if ($addedNode.nodeName == sectionNodeName) {
          let sectionNum = ++sectionCount
          log('search result section', sectionNum, 'added')
          processSection($addedNode, sectionNum)
        }
      }
      // Additional sections are removed when the search is changed
      for (let $removedNode of mutation.removedNodes) {
        if (!($removedNode instanceof HTMLElement)) continue
        if ($removedNode.nodeName == sectionNodeName && sectionObservers.has($removedNode)) {
          log('disconnecting removed section observers')
          for (let observer of sectionObservers.get($removedNode).values()) {
            observer.disconnect()
          }
          sectionObservers.delete($removedNode)
          for (let observer of sectionItemObservers.get($removedNode).values()) {
            observer.disconnect()
          }
          sectionObservers.delete($removedNode)
          sectionItemObservers.delete($removedNode)
          sectionCount--
        }
      }
    }
  }, {
    name: `search <${sectionElement}> contents (for new sections being added)`,
    observers: pageObservers,
  })

  let $initialSections = /** @type {NodeListOf<HTMLElement>} */ ($sections.querySelectorAll(sectionElement))
  log($initialSections.length, `initial search result section${s($initialSections.length)}`)
  for (let $initialSection of $initialSections) {
    processSection($initialSection, ++sectionCount)
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

/**
 * If a video's action menu was opened, watch for that video being dismissed.
 * When dismissed, display a timer and hide the dismissed video when it elapses.
 */
function observeVideoHiddenState() {
  /** @type {Element} */
  let $elementToHide
  /** @type {HTMLElement} */
  let $pie
  /** @type {HTMLButtonElement} */
  let $tellUsWhyButton
  /** @type {HTMLButtonElement} */
  let $undoButton
  /** @type {{$container: Element, small?: boolean}} */
  let pieConfig
  let startTime
  let timeout

  function cleanup() {
    stopTimer()
    $undoButton?.removeEventListener('click', cleanup)
    $tellUsWhyButton?.removeEventListener('click', onTellUsWhyClick)
    $pie?.remove()
  }

  /**
   * @param {{
   *   delay?: number
   *   direction?: string
   *   duration?: number
   * }} [options]
   */
  function displayPie({delay, direction, duration} = {}) {
    $pie?.remove()
    $pie = document.createElement('div')
    $pie.classList.add('cpfyt-pie')
    // The mobile version doesn't have a hook in its HTML to use for styling, so
    // style manually based on the current backgroundColor.
    let bgColor = getComputedStyle(document.documentElement).backgroundColor
    $pie.style.setProperty('--cpfyt-pie-background-color', bgColor)
    $pie.style.setProperty('--cpfyt-pie-color', bgColor == 'rgb(255, 255, 255)' ? '#065fd4' : '#3ea6ff')
    if (delay) $pie.style.setProperty('--cpfyt-pie-delay', `${delay}ms`)
    if (direction) $pie.style.setProperty('--cpfyt-pie-direction', direction)
    if (duration) $pie.style.setProperty('--cpfyt-pie-duration', `${duration}ms`)
    if (pieConfig.small) $pie.style.setProperty('--cpfyt-pie-fontSize', '100%')
    $pie.addEventListener('click', cleanup)
    pieConfig.$container?.append($pie)
  }

  function onTellUsWhyClick() {
    let elapsedTime = Date.now() - startTime
    stopTimer()
    // Rapidly unwind the pie timer from its current time
    displayPie({
      direction: 'reverse',
      delay: Math.round((elapsedTime - undoHideDelayMs) / 4),
      duration: undoHideDelayMs / 4,
    })
    // Restart the timer when the Tell us why dialog is closed
    onDialogClosed = () => {
      startTimer()
      displayPie()
    }
  }

  function setup() {
    $undoButton?.addEventListener('click', cleanup)
    $tellUsWhyButton?.addEventListener('click', onTellUsWhyClick)
    startTimer()
    displayPie()
  }

  function startTimer() {
    startTime = Date.now()
    timeout = setTimeout(() => {
      $elementToHide?.classList.add(Classes.HIDE_HIDDEN)
      cleanup()
      // Remove the class if the Undo button is clicked later, e.g. if
      // this feature is disabled after hiding a video.
      $undoButton.addEventListener('click', () => {
        $elementToHide?.classList.remove(Classes.HIDE_HIDDEN)
      })
    }, undoHideDelayMs)
  }

  function stopTimer() {
    clearTimeout(timeout)
  }

  if (desktop) {
    let $video = $lastClickedElement?.closest('ytd-rich-grid-media, yt-lockup-view-model')
    if (!$video) return

    observeElement($video, () => {
      // ytd-rich-grid-media gets an is-dismissed attribute
      let isDismissed = $video.hasAttribute('is-dismissed')
      // yt-lockup-view-model gets its contents replaced
      let $ytLockupDismissedContent = $video.querySelector('.ytDismissibleItemReplacedContent')
      if (!isDismissed && !$ytLockupDismissedContent) return

      log('hideHiddenVideos: video hidden, showing timer')
      // Hide the video element itself when not in a grid item (Related)
      $elementToHide = $video.closest('ytd-rich-item-renderer') || $video
      let $actions = /** @type {HTMLElement} */ ($video.querySelector(
        'ytd-notification-multi-action-renderer, notification-multi-action-renderer'
      ))
      let $buttons = $actions.querySelectorAll('button')
      $undoButton = $buttons[0]
      $tellUsWhyButton = $buttons[1]
      // Display a small pie timer after "Video removed" in yt-lockup-view-model
      pieConfig = {
        $container: $actions.querySelector('.ytNotificationMultiActionRendererTextContainer') || $actions,
        small: Boolean($ytLockupDismissedContent),
      }
      setup()
    }, {
      name: `context menu video (hideHiddenVideos)`,
      observers: pageObservers,
    }, {
      // ytd-rich-grid-media
      attributes: true,
      attributeFilter: ['is-dismissed'],
      // yt-lockup-view-model
      childList: true,
    })
  }

  if (mobile) {
    /** @type {HTMLElement} */
    let $video
    if (isHomePage()) {
      $video = $lastClickedElement?.closest('ytm-rich-item-renderer')
    }
    else if (isSubscriptionsPage()) {
      $video = $lastClickedElement?.closest('lazy-list')
    }
    // TODO ytm-notification-multi-action-renderer replaces hidden Related videos
    // else if (isVideoPage()) {
    //   $video = $lastClickedElement?.closest('ytm-video-with-context-renderer')
    // }
    if (!$video) return

    observeElement($video, () => {
      let $dismissedContent = $video.querySelector('ytm-notification-multi-action-renderer')
      if (!$dismissedContent) return

      log('hideHiddenVideos: video hidden, showing timer')
      $elementToHide = $video
      if (isSubscriptionsPage()) {
        $elementToHide = $video.closest('ytm-item-section-renderer')
      }
      $undoButton = $dismissedContent.querySelector('button')
      pieConfig = {$container: $dismissedContent.firstElementChild}
      setup()
    }, {
      name: `context menu video (hideHiddenVideos)`,
      observers: pageObservers,
    })
  }
}

/**
 * Processes initial videos in a list element, and new videos as they're added.
 * @param {{
 *   name: string
 *   selector: string
 *   stopIf?: () => boolean
 *   page: string
 *   videoElements: Set<string>
 * }} options
 */
async function observeVideoList(options) {
  let {name, selector, stopIf = currentUrlChanges(), page, videoElements} = options
  let videoNodeNames = new Set(Array.from(videoElements, (name) => name.toUpperCase()))

  let $list = await getElement(selector, {name, stopIf})
  if (!$list) return

  let itemCount = 0

  observeElement($list, (mutations) => {
    let newItemCount = 0
    for (let mutation of mutations) {
      for (let $addedNode of mutation.addedNodes) {
        if (!($addedNode instanceof HTMLElement)) continue
        if (videoNodeNames.has($addedNode.nodeName)) {
          manuallyHideVideo($addedNode)
          waitForVideoOverlay($addedNode, `item ${++itemCount}`)
          newItemCount++
        }
      }
    }
    if (newItemCount > 0) {
      log(newItemCount, `${page} video${s(newItemCount)} added`)
    }
  }, {
    name: `${name} (for new items being added)`,
    observers: pageObservers,
  })

  let initialItemCount = 0
  for (let $initialItem of $list.children) {
    if (videoNodeNames.has($initialItem.nodeName)) {
      manuallyHideVideo($initialItem)
      waitForVideoOverlay($initialItem, `item ${++itemCount}`)
      initialItemCount++
    }
  }
  log(initialItemCount, `initial ${page} video${s(initialItemCount)}`)
}

/** @param {MouseEvent} e */
function onDocumentClick(e) {
  $lastClickedElement = /** @type {HTMLElement} */ (e.target)
  if (desktop && loggedIn && (config.disableHomeFeed || config.redirectLogoToSubscriptions)) {
    let $logoLink = $lastClickedElement.closest('a#logo')
    if ($logoLink) {
      // @ts-ignore
      let browseEndpoint = $logoLink.data?.browseEndpoint
      // @ts-ignore
      let webCommandMetadata = $logoLink.data?.commandMetadata?.webCommandMetadata
      if (browseEndpoint && webCommandMetadata) {
        log('redirecting YouTube logo click to Subscriptions')
        browseEndpoint.browseId = 'FEsubscriptions'
        webCommandMetadata.url = '/feed/subscriptions'
      }
    }
  }
  if (desktop && config.redirectShorts) {
    let $shortsLink = /** @type {HTMLAnchorElement} */ ($lastClickedElement.closest('a[href^="/shorts/'))
    if ($shortsLink) {
      // @ts-ignore
      let webCommandMetadata = $shortsLink._data?.commandMetadata?.webCommandMetadata
      if (webCommandMetadata) {
        log('redirecting Shorts video click to normal player')
        webCommandMetadata.url = `/watch?v=${$shortsLink.pathname.split('/').at(-1)}`
        webCommandMetadata.webPageType = 'WEB_PAGE_TYPE_WATCH'
      }
    }
  }
}

/** @param {HTMLElement} $menu */
function onMobileMenuAppeared($menu) {
  log('menu appeared')

  if (config.hideOpenApp) {
    let menuItems = $menu.querySelectorAll('ytm-menu-item')
    for (let $menuItem of menuItems) {
      let itemText = $menuItem.textContent
      if (itemText == getYtString('OPEN_APP')) {
        log('tagging Open App menu item')
        $menuItem.classList.add(Classes.HIDE_OPEN_APP)
        break
      }
    }
  }

  if (config.hideChannels) {
    addHideChannelToMobileVideoMenu($menu)
  }
  if (config.hideHiddenVideos) {
    observeVideoHiddenState()
  }
}

/** @param {Element} $video */
function hideWatched($video) {
  if (!config.hideWatched || isSearchPage()) return
  // Watch % is obtained from progress bar width when a video has one
  let $progressBar
  if (desktop) {
    // TODO Remove #progress after confirming all videos have moved to yt-lockup-view-model
    $progressBar = $video.querySelector('#progress, .ytThumbnailOverlayProgressBarHostWatchedProgressBarSegment')
  }
  if (mobile) {
    $progressBar = $video.querySelector('.thumbnail-overlay-resume-playback-progress')
  }
  let hide = false
  if ($progressBar) {
    let progress = parseInt(/** @type {HTMLElement} */ ($progressBar).style.width)
    hide = progress >= Number(config.hideWatchedThreshold)
  }
  $video.classList.toggle(Classes.HIDE_WATCHED, hide)
  return hide
}

/**
 * Tag individual video elements to be hidden by options which would need too
 * complex or broad CSS :has() relative selectors.
 * @param {Element} $video video container element
 * @param {{hideDismissed?: boolean}} [options]
 */
function manuallyHideVideo($video, {hideDismissed = false} = {}) {
  if (hideDismissed) {
    // This option is only used for yt-lockup-view-model videos
    let $dismissedContent = $video.querySelector('.ytDismissibleItemReplacedContent')
    let isDismissed = Boolean($dismissedContent)
    $video.classList.toggle(Classes.HIDE_HIDDEN, isDismissed)
    if (isDismissed) {
      let $undoButton = $dismissedContent.querySelector('button')
      $undoButton?.addEventListener('click', () => {
        $video.classList.remove(Classes.HIDE_HIDDEN)
      })
    }
  }

  hideWatched($video)

  // Streamed videos are identified using the video title's aria-label
  if (config.hideStreamed) {
    let hide = false
    if (desktop) {
      let $metadata = /** @type {HTMLElement} */ ($video.querySelector(
        // TODO Remove #metadata-line after confirming all videos have moved to yt-lockup-view-model
        '#metadata-line, yt-content-metadata-view-model .yt-content-metadata-view-model__delimiter + .yt-content-metadata-view-model__metadata-text'
      ))
      if ($metadata) {
        hide = Boolean($metadata.innerText.match(getString('STREAMED_METADATA_INNERTEXT_RE')))
      }
    }
    if (mobile) {
      let $videoTitleWithLabel = $video.querySelector('.media-item-headline .yt-core-attributed-string[aria-label]')
      if ($videoTitleWithLabel) {
        hide = $videoTitleWithLabel.getAttribute('aria-label').includes(getString('STREAMED_TITLE_ARIA_LABEL'))
      }
    }
    $video.classList.toggle(Classes.HIDE_STREAMED, hide)
  }

  if (config.hideChannels && config.hiddenChannels.length > 0 && !isSubscriptionsPage()) {
    let channel = getChannelDetailsFromVideo($video)
    let hide = false
    if (channel) {
      hide = isChannelHidden(channel)
    }
    $video.classList.toggle(Classes.HIDE_CHANNEL, hide)
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

function takeSnapshot() {
  /** @type {HTMLVideoElement} */
  let $video
  /** @type {string} */
  let channel
  /** @type {string} */
  let title
  if (isVideoPage()) {
    $video = /** @type {HTMLVideoElement} */ (document.querySelector('#movie_player video'))
    channel = document.querySelector('ytd-watch-flexy #text.ytd-channel-name')?.getAttribute('title')
    title = document.querySelector('ytd-watch-flexy #title.ytd-watch-metadata yt-formatted-string')?.getAttribute('title')
  }
  else if (isShortsPage()) {
    $video = /** @type {HTMLVideoElement} */ (document.querySelector('ytd-reel-video-renderer video'))
    channel = /** @type {HTMLElement} */ (document.querySelector('ytd-reel-video-renderer .ytReelChannelBarViewModelChannelName'))?.innerText
    title = /** @type {HTMLElement} */ (document.querySelector('ytd-reel-video-renderer .ytShortsVideoTitleViewModelShortsVideoTitle'))?.innerText
  } else {
    warn('takeSnapshot: called on unexpected page', location.pathname)
    return
  }

  if (!$video) {
    warn('takeSnapshot: video not found')
    return
  }

  let $canvas = document.createElement('canvas')
  $canvas.width = $video.videoWidth
  $canvas.height = $video.videoHeight

  try {
    let context = $canvas.getContext('2d')
    context.drawImage($video, 0, 0, $canvas.width, $canvas.height)
    let $a = document.createElement('a')
    $a.href = $canvas.toDataURL(`image/${config.snapshotFormat}`, Number(config.snapshotQuality))
    $a.download = [channel, title, $video.currentTime]
      .filter(Boolean)
      .join(' - ') + {jpeg: '.jpg', png: '.png'}[config.snapshotFormat]
    log('takeSnapshot:', $a.download)
    document.body.appendChild($a)
    $a.click()
    document.body.removeChild($a)
  } catch (e) {
    warn('error taking snapshot', e)
  }
}

/**
 * Forces the video to resize if options which affect its size are used.
 */
function triggerVideoPageResize() {
  if (desktop && isVideoPage()) {
    window.dispatchEvent(new Event('resize'))
  }
}

async function tweakHomePage() {
  if (config.disableHomeFeed && loggedIn) {
    redirectFromHome()
    return
  }
  if (
    // Videos need to be manually hidden
    !config.hideWatched && !config.hideStreamed && !config.hideChannels &&
    // Dismissed videos need to be manually hidden when switching categories
    (mobile || !config.hideHiddenVideos)
  ) return
  if (desktop) {
    observeDesktopRichGridItems({page: 'home'})
  }
  if (mobile) {
    observeVideoList({
      name: 'home <ytm-rich-grid-renderer> contents',
      selector: '.tab-content[tab-identifier="FEwhat_to_watch"] .rich-grid-renderer-contents',
      page: 'home',
      videoElements: new Set(['ytm-rich-item-renderer']),
    })
  }
}

async function tweakChannelPage() {
  let seen = new Map()
  function isOnFeaturedTab() {
    if (!seen.has(location.pathname)) {
      let section = location.pathname.match(URL_CHANNEL_RE)[1]
      seen.set(location.pathname, section == undefined || section == 'featured')
    }
    return seen.get(location.pathname)
  }

  if (desktop && config.pauseChannelTrailers && isOnFeaturedTab()) {
    let $channelTrailer = /** @type {HTMLVideoElement} */ (
      await getElement('ytd-channel-video-player-renderer video', {
        name: `channel trailer`,
        stopIf: () => !isOnFeaturedTab(),
        timeout: 2000,
      })
    )
    if ($channelTrailer) {
      function pauseTrailer() {
        log(`pauseChannelTrailers: pausing channel trailer`, {readyState: $channelTrailer.readyState})
        $channelTrailer.pause()
      }
      // Prevent the next play attempt if the trailer hasn't started yet
      if ($channelTrailer.paused && $channelTrailer.readyState == 0) {
        $channelTrailer.addEventListener('play', pauseTrailer, {once: true})
      } else {
        pauseTrailer()
      }
    }
  }
}

// TODO Hide ytd-channel-renderer if a channel is hidden
function tweakSearchPage() {
  if (desktop && config.hideShorts) {
    run(async function() {
      let $chips = await getElement('ytd-search #chip-bar #chips', {
        name: 'search chip bar (hideShorts)',
        stopIf: currentUrlChanges(),
        timeout: 500,
      })
      if (!$chips) return
      for (let $chip of $chips.children) {
        if (/** @type {HTMLElement} */ ($chip).innerText == getString('SHORTS')) {
          $chip.classList.add('HideShorts')
          break
        }
      }
    })
  }

  if (!config.hideStreamed && !config.hideChannels) return

  if (desktop) {
    observeSearchResultSections({
      name: 'search <ytd-section-list-renderer> contents',
      selector: 'ytd-search #contents.ytd-section-list-renderer',
      sectionContentsSelector: '#contents',
      sectionElement: 'ytd-item-section-renderer',
      suggestedSectionElement: 'ytd-shelf-renderer',
      videoElement: 'ytd-video-renderer',
    })
  }

  if (mobile) {
    observeSearchResultSections({
      name: 'search <lazy-list>',
      selector: 'ytm-search ytm-section-list-renderer > lazy-list',
      sectionContentsSelector: 'lazy-list',
      sectionElement: 'ytm-item-section-renderer',
      videoElement: 'ytm-video-with-context-renderer',
    })
  }
}

async function tweakShortsPage() {
  if (config.stopShortsLooping) {
    let $player = await getElement(desktop ? '#shorts-player' : '#movie_player', {
      name: 'shorts player',
      stopIf: currentUrlChanges(),
    })
    if (!$player) return

    setTimeout(() => {
      log('stopShortsLooping: turning looping off')
      // @ts-ignore
      $player.setLoopVideo?.(false)
    }, 500)
    function onStateChange(playerState) {
      if (playerState == 1) {
        setTimeout(() => {
          log('stopShortsLooping: turning looping off')
          // @ts-ignore
          $player.setLoopVideo?.(false)
        }, 500)
      }
    }
    $player.addEventListener('onStateChange', onStateChange)
    pageObservers.set('#shorts-player onStateChange', {
      disconnect() {
        $player.removeEventListener?.('onStateChange', onStateChange)
      }
    })
  }
}

async function tweakSubscriptionsPage() {
  if (!config.hideWatched && !config.hideStreamed) return
  if (desktop) {
    observeDesktopRichGridItems({page: 'subscriptions'})
  }
  if (mobile) {
    observeVideoList({
      name: 'subscriptions <lazy-list>',
      selector: '.tab-content[tab-identifier="FEsubscriptions"] ytm-section-list-renderer > lazy-list',
      page: 'subscriptions',
      videoElements: new Set(['ytm-item-section-renderer']),
    })
  }
}

async function tweakVideoPage() {
  if (config.disableAutoplay) {
    disableAutoplay()
  }
  if (desktop && config.alwaysUseTheaterMode) {
    alwaysUseTheaterMode()
  }
  if (desktop && config.alwaysUseOriginalAudio) {
    alwaysUseOriginalAudio()
  }
  if (desktop && config.hideChannels && !config.hideEndVideos && config.hiddenChannels.length > 0) {
    observeDesktopEndscreenVideos()
  }

  if (config.hideRelated || (!config.hideWatched && !config.hideStreamed && !config.hideChannels)) return

  if (desktop) {
    let $section = await getElement('#related.ytd-watch-flexy ytd-item-section-renderer', {
      name: 'related <ytd-item-section-renderer>',
      stopIf: currentUrlChanges(),
    })
    if (!$section) return

    let $contents = $section.querySelector('#contents')
    let itemCount = 0

    /** @param {Element} $item  */
    function processItem($item) {
      manuallyHideVideo($item, {hideDismissed: $item.nodeName == 'YT-LOCKUP-VIEW-MODEL'})
      if ($item.nodeName == 'YTD-COMPACT-VIDEO-RENDERER') {
        waitForVideoOverlay($item, `related item ${++itemCount}`)
      }
    }

    function processCurrentItems() {
      itemCount = 0
      for (let $item of $contents.children) {
        // TODO Remove YTD-COMPACT-VIDEO-RENDERER after confirming all Related videos have moved to YT-LOCKUP-VIEW-MODEL
        if ($item.nodeName == 'YTD-COMPACT-VIDEO-RENDERER' || $item.nodeName == 'YT-LOCKUP-VIEW-MODEL') {
          processItem($item)
        }
      }
    }

    // If the video changes (e.g. a related video is clicked) on desktop,
    // the related items section is refreshed - the section has a can-show-more
    // attribute while this is happening.
    observeElement($section, () => {
      if ($section.getAttribute('can-show-more') == null) {
        log('can-show-more attribute removed - reprocessing refreshed items')
        processCurrentItems()
      }
    }, {
      name: 'related <ytd-item-section-renderer> can-show-more attribute',
      observers: pageObservers,
    }, {
      attributes: true,
      attributeFilter: ['can-show-more'],
    })

    observeElement($contents, (mutations) => {
      let newItemCount = 0
      for (let mutation of mutations) {
        for (let $addedNode of mutation.addedNodes) {
          if (!($addedNode instanceof HTMLElement)) continue
          // TODO Remove YTD-COMPACT-VIDEO-RENDERER after confirming all Related videos have moved to YT-LOCKUP-VIEW-MODEL
          if ($addedNode.nodeName == 'YTD-COMPACT-VIDEO-RENDERER' || $addedNode.nodeName == 'YT-LOCKUP-VIEW-MODEL') {
            processItem($addedNode)
            newItemCount++
          }
        }
      }
      if (newItemCount > 0) {
        log(newItemCount, `related item${s(newItemCount)} added`)
      }
    }, {
      name: `related <ytd-item-section-renderer> contents (for new items being added)`,
      observers: pageObservers,
    })

    processCurrentItems()
  }

  if (mobile) {
    // If the video changes on mobile, related videos are rendered from scratch
    observeVideoList({
      name: 'related <lazy-list>',
      selector: 'ytm-item-section-renderer[section-identifier="related-items"] > lazy-list',
      page: 'related',
      // <ytm-compact-autoplay-renderer> displays as a large item on bigger mobile screens
      videoElements: new Set(['ytm-video-with-context-renderer', 'ytm-compact-autoplay-renderer']),
    })
  }
}

// TODO Check if we need to update this for <yt-lockup-view-model> videos
/**
 * Wait for video overlays with watch progress when they're loazed lazily.
 * @param {Element} $video
 * @param {string} uniqueId
 * @param {Map<string, import("./types").Disconnectable>} [observers]
 */
function waitForVideoOverlay($video, uniqueId, observers) {
  if (!config.hideWatched) return

  if (desktop) {
    // The overlay element is initially empty
    let $overlays = $video.querySelector('#overlays')
    if (!$overlays || $overlays.childElementCount > 0) return

    observeElement($overlays, (mutations, observer) => {
      let nodesAdded = false
      for (let mutation of mutations) {
        for (let $addedNode of mutation.addedNodes) {
          if (!nodesAdded) nodesAdded = true
          if ($addedNode.nodeName == 'YTD-THUMBNAIL-OVERLAY-RESUME-PLAYBACK-RENDERER') {
            hideWatched($video)
          }
        }
      }
      if (nodesAdded) {
        observer.disconnect()
      }
    }, {
      name: `${uniqueId} #overlays (for overlay elements being added)`,
      observers: [observers, pageObservers].filter(Boolean),
    })
  }

  if (mobile) {
    // The overlay element has a different initial class
    let $placeholder = $video.querySelector('.video-thumbnail-overlay-bottom-group')
    if (!$placeholder) return

    observeElement($placeholder, (mutations, observer) => {
      let nodesAdded = false
      for (let mutation of mutations) {
        for (let $addedNode of mutation.addedNodes) {
          if (!nodesAdded) nodesAdded = true
          if ($addedNode.nodeName == 'YTM-THUMBNAIL-OVERLAY-RESUME-PLAYBACK-RENDERER') {
            hideWatched($video)
          }
        }
      }
      if (nodesAdded) {
        observer.disconnect()
      }
    }, {
      name: `${uniqueId} .video-thumbnail-overlay-bottom-group (for overlay elements being added)`,
      observers: [observers, pageObservers].filter(Boolean),
    })
  }
}
//#endregion

//#region Global patching
let Request_clone = Request.prototype.clone
let Response_clone = Response.prototype.clone
let ytInitialPlayerResponse
let ytInitialReelWatchSequenceResponse

function filterShortsAd(entry) {
  return entry.command?.reelWatchEndpoint?.adClientParams?.isAd != true
}

function processPlayerResponse(data) {
  if (data.videoDetails) {
    delete data.adPlacements
    delete data.adSlots
    delete data.playerAds
  }
}

function processReelWatchSequenceResponse(data) {
  if (Array.isArray(data.entries) && data.entries[0]?.command?.reelWatchEndpoint) {
    data.entries = data.entries.filter(filterShortsAd)
  }
  if (Array.isArray(data.reelWatchSequenceResponse?.entries) &&
      data.reelWatchSequenceResponse.entries[0]?.command?.reelWatchEndpoint) {
    data.reelWatchSequenceResponse.entries = data.reelWatchSequenceResponse.entries.filter(filterShortsAd)
  }
}

function proxyFetch(target, thisArg, argArray) {
  let request = argArray?.[0]
  let url = request?.url
  if (
    config && !config.blockAds ||
    !(request instanceof Request) ||
    !url || !url.includes('/player') && !url.includes('/reel_watch_sequence') ||
    // Ignore adblock detection requests with data: URL payloads
    !Request_clone.call(request).url.startsWith('https://')
  ) {
    return Reflect.apply(target, thisArg, argArray)
  }

  return Reflect.apply(target, thisArg, argArray).then(response => {
    return Response_clone.call(response).text().then(responseText => {
      try {
        let data = JSON.parse(responseText)
        if (url.includes('/player')) {
          processPlayerResponse(data)
        }
        else if (url.includes('/reel_watch_sequence')) {
          processReelWatchSequenceResponse(data)
        }
        return new Response(JSON.stringify(data))
      } catch (error) {
        warn('blockAds: error parsing', new URL(url).pathname, 'response:', error, responseText)
      }
      return response
    })
  })
}

try {
  Object.defineProperty(window, 'ytInitialPlayerResponse', {
    set(data) {
      ytInitialPlayerResponse = data
      if (ytInitialPlayerResponse != null && (!config || config.blockAds)) {
        processPlayerResponse(ytInitialPlayerResponse)
      }
    },
    get() {
      return ytInitialPlayerResponse
    }
  })
} catch(error) {
  if (!config || config.blockAds) {
    warn('blockAds: error defining ytInitialPlayerResponse:', error)
  }
}

try {
  Object.defineProperty(window, 'ytInitialReelWatchSequenceResponse', {
    set(data) {
      ytInitialReelWatchSequenceResponse = data
      if (ytInitialReelWatchSequenceResponse != null && (!config || config.blockAds)) {
        processReelWatchSequenceResponse(ytInitialReelWatchSequenceResponse)
      }
    },
    get() {
      return ytInitialReelWatchSequenceResponse
    }
  })
} catch(error) {
  if (!config || config.blockAds) {
    warn('blockAds: error defining ytInitialReelWatchSequenceResponse:', error)
  }
}

try {
  window.fetch = new Proxy(window.fetch, {apply: proxyFetch})
} catch (error) {
  if (!config || config.blockAds) {
    warn('blockAds: error proxying fetch:', error)
  }
}
//#endregion

//#region Main
let channelName = crypto.randomUUID()
let channel = new BroadcastChannel(channelName)

function main() {
  if (config.enabled) {
    if (mobile && config.allowBackgroundPlay) {
      allowBackgroundPlay()
    }
    if (mobile) {
      // Mobile uses some of YouTube's own translations in its CSS
      // @ts-ignore
      waitFor(() => window.ytcfg?.msgs, 'ytcfg.msgs').then(configureCss)
    } else {
      configureCss()
      triggerVideoPageResize()
    }
    observeTitle()
    observePopups()
    document.addEventListener('click', onDocumentClick, true)
    globalObservers.set('document clicks', {
      disconnect() {
        document.removeEventListener('click', onDocumentClick, true)
      }
    })
  }
}

/** @param {Partial<import("./types").SiteConfig>} changes */
function configChanged(changes) {
  if (!changes.hasOwnProperty('enabled')) {
    log('config changed', changes)
    configureCss()
    triggerVideoPageResize()
    handleCurrentUrl()
    return
  }

  log(`${changes.enabled ? 'en' : 'dis'}abling extension functionality`)
  if (changes.enabled) {
    main()
  } else {
    configureCss()
    triggerVideoPageResize()
    disconnectObservers(pageObservers, 'page')
    disconnectObservers(globalObservers,' global')
  }
}

async function initLang() {
  /** @param {HTMLElement} $el */
  async function waitForLang($el) {
    if ($el.lang) return $el.lang
    let startTime = Date.now()
    return new Promise(resolve => {
      let observer = new MutationObserver(() => {
        if ($el.lang) {
          let elapsed = Date.now() - startTime
          if (elapsed > 0) {
            log(version, 'lang became available after', elapsed, 'ms')
          }
          observer.disconnect()
          resolve($el.lang)
        }
      })
      observer.observe($el, {attributes: true, attributeFilter: ['lang']})
    })
  }
  if (mobile) {
    lang = await waitForLang(await getElement('body', {name: 'mobile <body> for lang'}))
  } else {
    lang = await waitForLang(document.documentElement)
  }
  log('lang is', lang)
  langCodes = lang.split('-')
    .map((_, index, parts) => parts.slice(0, parts.length - index).join('-'))
    .filter(langCode => Object.hasOwn(locales, langCode))
    .concat('en')
  main()
}

/**
 * @param {MessageEvent<import("./types").SiteConfigMessage>} message
 */
function receiveConfigFromContentScript({data: {type, siteConfig}}) {
  if (type == 'initial') {
    config = {...defaultConfig, ...siteConfig}
    debug = config.debug
    debugManualHiding = config.debugManualHiding
    log('initial config', config, {version, loggedIn})

    // Let the options page know which version is being used
    storeConfigChanges({version})

    initLang()
    return
  }

  if ('debug' in siteConfig) {
    log('disabling debug mode')
    debug = siteConfig.debug
    log('enabled debug mode')
    return
  }

  if ('debugManualHiding' in siteConfig) {
    debugManualHiding = siteConfig.debugManualHiding
    log(`${debugManualHiding ? 'en' : 'dis'}abled debugging manual hiding`)
    configureCss()
    return
  }

  Object.assign(config, siteConfig)
  configChanged(siteConfig)
}

/** @param {Partial<import("./types").OptionsConfig>} configChanges */
function storeConfigChanges(configChanges) {
  channel.postMessage(configChanges)
}

channel.addEventListener('message', receiveConfigFromContentScript)
window.postMessage({
  type: 'init',
  channelName,
  configKeys: Object.keys(defaultConfig),
}, location.origin)
//#endregion

}()