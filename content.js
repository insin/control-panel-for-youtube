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

//#region Config
/** @type {import("./types").Config} */
let config = {
  version,
  disableAutoplay: true,
  enabled: true,
  hideChat: false,
  hideComments: false,
  hideLive: false,
  hideRelated: false,
  hideShorts: true,
  hideSponsored: true,
  hideStreamed: false,
  hideUpcoming: false,
  redirectShorts: true,
  // Desktop only
  hideEndCards: false,
  hideEndVideos: false,
  tidyGuideSidebar: false,
  // Mobile only
  hideExploreButton: true,
  hideOpenApp: true,
}
//#endregion

//#region State
/** @type {MutationObserver[]} */
let pageObservers = []
//#endregion

//#region Utility functions
function addStyle() {
  let $style = document.createElement('style')
  $style.dataset.insertedBy = 'control-panel-for-youtube'
  document.querySelector('head').appendChild($style)
  return $style
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

/**
 * Convenience wrapper for the MutationObserver API - the callback is called
 * immediately to support using an observer and its options as a trigger for any
 * change, without looking at MutationRecords.
 * @param {Node} $element
 * @param {MutationCallback} callback
 * @param {string} name
 * @param {MutationObserverInit} options
 * @return {MutationObserver}
 */
function observeElement($element, callback, name, options = {childList: true}) {
  if (options.childList && callback.length > 0) {
    log(`observing ${name}`, $element)
  } else {
    log (`observing ${name}`)
  }

  let observer = new MutationObserver(callback)
  callback([], observer)
  observer.observe($element, options)
  observer['name'] = name
  return observer
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
  let $style

  return function configureCss() {
    if ($style == null) {
      $style = addStyle()
    }
    if (!config.enabled) {
      $style.textContent = ''
      return
    }
    let cssRules = []
    let hideCssSelectors = []

    if (config.disableAutoplay) {
      if (desktop) {
        hideCssSelectors.push('button[data-tooltip-target-id="ytp-autonav-toggle-button"]')
      }
      if (mobile) {
        hideCssSelectors.push('button.ytm-autonav-toggle-button-container')
      }
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

    if (config.hideLive) {
      if (desktop) {
        hideCssSelectors.push(
          // Grid item (Home, Subscriptions)
          'ytd-rich-item-renderer:has(ytd-thumbnail[is-live-video])',
          // List item (Search)
          'ytd-video-renderer:has(ytd-thumbnail[is-live-video])',
        )
      }
      if (mobile) {
        hideCssSelectors.push('ytm-video-with-context-renderer:has(ytm-thumbnail-overlay-time-status-renderer[data-style="LIVE"])')
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
          'ytd-guide-entry-renderer:has(> a[title="Shorts"])',
          // Mini side nav item
          'ytd-mini-guide-entry-renderer[aria-label="Shorts"]',
          // Shelf in Home and Subscriptions
          'ytd-rich-shelf-renderer[is-shorts]',
          // Shorts chip in Search
          'yt-chip-cloud-chip-renderer:has(> yt-formatted-string[title="Shorts"])',
          // Shelf in Search
          'ytd-reel-shelf-renderer',
          // Shorts in search results
          'ytd-video-renderer:has(a[href^="/shorts"])',
          // Shorts tab in channel profiles
          'ytd-browse yt-tab-shape[tab-title="Shorts"]',
        )
      }
      if (mobile) {
        hideCssSelectors.push(
          // Bottom nav item
          'ytm-pivot-bar-item-renderer:has(> div.pivot-shorts)',
          // Shelf in Home
          'ytm-rich-section-renderer:has(ytm-reel-shelf-renderer)',
          // Shelf in Search
          'ytm-reel-shelf-renderer',
          // Shorts in search results
          'ytm-video-with-context-renderer:has(a[href^="/shorts"])',
          // Shorts tab in channel profiles
          'ytm-browse yt-tab-shape[tab-title="Shorts"]',
        )
      }
    }

    if (config.hideSponsored) {
      if (desktop) {
        hideCssSelectors.push(
          // Big promos on Home screen
          '#masthead-ad',
          'ytd-rich-section-renderer:has(> #content > ytd-statement-banner-renderer)',
          // Video listings
          'ytd-rich-item-renderer:has(> .ytd-rich-item-renderer > ytd-ad-slot-renderer)',
          // Search results
          '#contents.style-scope.ytd-search-pyv-renderer',
          'ytd-ad-slot-renderer.style-scope.ytd-item-section-renderer',
          // Above Watch Next videos
          '#player-ads',
          // Watch Next videos
          '#items > ytd-ad-slot-renderer',
        )
      }
      if (mobile) {
        hideCssSelectors.push(
          // Search results
          'ytm-item-section-renderer:has(> lazy-list > ad-slot-renderer)'
        )
      }
    }

    if (config.hideStreamed) {
      if (desktop) {
        hideCssSelectors.push(
          // Grid item (Home, Subscriptions)
          'ytd-rich-item-renderer:has(a#video-title-link[aria-label*="views Streamed"])',
          // List item (Search)
          'ytd-video-renderer:has(a#video-title[aria-label*="views Streamed"])'
        )
      }
      if (mobile) {
        hideCssSelectors.push('ytm-video-with-context-renderer:has(span.yt-core-attributed-string[aria-label*="views Streamed"])')
      }
    }

    if (config.hideUpcoming) {
      if (desktop) {
        hideCssSelectors.push('ytd-rich-item-renderer:has(ytd-thumbnail-overlay-time-status-renderer[overlay-style="UPCOMING"])')
      }
      if (mobile) {
        hideCssSelectors.push('ytm-video-with-context-renderer:has(ytm-thumbnail-overlay-time-status-renderer[data-style="UPCOMING"])')
      }
    }

    if (desktop) {
      if (config.hideEndCards) {
        hideCssSelectors.push('#movie_player .ytp-ce-element')
      }
      if (config.hideEndVideos) {
        hideCssSelectors.push('#movie_player .ytp-endscreen-content')
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
        )
      }
    }

    if (hideCssSelectors.length > 0) {
      cssRules.push(`
        ${hideCssSelectors.join(',\n')} {
          display: none !important;
        }
      `)
    }

    $style.textContent = cssRules.map(dedent).join('\n')
  }
})()
//#endregion

//#region Tweak functions
async function disableAutoplay() {
  let currentUrl = getCurrentUrl()
  /** @type {GetElementOptions} */
  let config = {name: 'Autoplay button', stopIf: () => currentUrl != getCurrentUrl()}
  if (desktop) {
    let $autoplayButton = await getElement('button[data-tooltip-target-id="ytp-autonav-toggle-button"]', config)
    // On desktop, initial Autoplay button HTML has style="display: none" and is
    // always checked on. Once it's displayed, we can determine its real state
    // and take action if needed.
    let observer
    observer = observeElement($autoplayButton, () => {
      if ($autoplayButton.style.display != 'none') {
        if ($autoplayButton?.querySelector('.ytp-autonav-toggle-button[aria-checked="true"]')) {
          log('turning Autoplay off')
          $autoplayButton.click()
        }
        observer?.disconnect()
      }
    }, 'autoplay button style', {attributes: true, attributeFilter: ['style']})
  }
  if (mobile) {
    let $autoplayButton = await getElement('button.ytm-autonav-toggle-button-container', config)
    // The Autoplay button always seems to load async on mobile, so we can check
    // it once available.
    if ($autoplayButton?.getAttribute('aria-pressed') == 'true') {
      log('turning Autoplay off')
      $autoplayButton.click()
    }
  }
}

/**
 * @param {(el: HTMLElement) => void} callback
 */
async function observeBottomSheet(callback) {
  let $bottomSheet = await getElement('bottom-sheet-container', {name: 'bottom sheet'})
  pageObservers.push(
    observeElement($bottomSheet, () => {
      callback($bottomSheet)
    }, 'bottom sheet')
  )
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
  }, '<title>')
}

function handleCurrentUrl() {
  if (pageObservers.length > 0) {
    log(
      `disconnecting ${pageObservers.length} page observer${s(pageObservers.length)}`,
      pageObservers.map(observer => observer['name'])
    )
    for (let observer of pageObservers) observer.disconnect()
    pageObservers = []
  }

  if (location.pathname.startsWith('/shorts/')) {
    if (config.redirectShorts) {
      redirectShort()
    }
  }
  else if (location.pathname == '/watch') {
    if (config.disableAutoplay) {
      disableAutoplay()
    }
    if (mobile && config.hideOpenApp) {
      observeBottomSheet(($bottomSheet) => {
        let menuItems = $bottomSheet.querySelectorAll('ytm-menu-item')
        for (let $menuItem of menuItems) {
          if ($menuItem.textContent == 'Open App') {
            $menuItem.classList.add('open-app-menu-item')
            break
          }
        }
      })
    }
  }
}

function redirectShort() {
  log('redirecting Short to normal player')
  let videoId = location.pathname.split('/').at(-1)
  let search = location.search ? location.search.replace('?', '&') : ''
  location.replace(`/watch?v=${videoId}${search}`)
}
//#endregion

//#region Main
function main() {
  configureCss()
  observeTitle()
}

function configChanged(changes) {
  log('config changed', changes)

  configureCss()
  handleCurrentUrl()
}

if (
  typeof GM == 'undefined' &&
  typeof chrome != 'undefined' &&
  typeof chrome.storage != 'undefined'
) {
  chrome.storage.local.get((storedConfig) => {
    Object.assign(config, storedConfig)
    log('initial config', {config})

    // Let the options page know the last version used
    chrome.storage.local.set({version})

    chrome.storage.onChanged.addListener((changes) => {
      let configChanges = Object.fromEntries(
        Object.entries(changes)
          // Don't change the version based on other pages
          .filter(([key]) => key != 'version')
          .map(([key, {newValue}]) => [key, newValue])
      )
      if (Object.keys(configChanges).length > 0) {
        Object.assign(config, configChanges)
        configChanged(configChanges)
      }
    })

    main()
  })
}
else {
  main()
}
//#endregion