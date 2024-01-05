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
  hideComments: false,
  hideLive: false,
  hideMerchEtc: true,
  hideMixes: false,
  hideRelated: false,
  hideSearchSuggestions: true,
  hideShorts: false,
  hideSponsored: true,
  hideStreamed: false,
  hideUpcoming: false,
  hideWatched: false,
  hideWatchedThreshold: '100',
  redirectShorts: false,
  // Desktop only
  hideChat: false,
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
  document.head.appendChild($style)
  return $style
}

function currentUrlIsNot(currentUrl) {
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

function disconnectPageObserver(name) {
  for (let i = pageObservers.length -1; i >= 0; i--) {
    let observer = pageObservers[i]
    if ('name' in observer && observer.name == name) {
      observer.disconnect()
      pageObservers.splice(i, 1)
      log(`disconnected ${name} observer`)
    }
  }
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
  log (`observing ${name}`)
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
          // Related video
          'ytd-compact-video-renderer:has(> .ytd-compact-video-renderer > ytd-thumbnail[is-live-video])',
        )
      }
      if (mobile) {
        hideCssSelectors.push('ytm-video-with-context-renderer:has(ytm-thumbnail-overlay-time-status-renderer[data-style="LIVE"])')
      }
    }

    if (config.hideMixes) {
      if (desktop) {
        hideCssSelectors.push(
          // Chip in Home
          'yt-chip-cloud-chip-renderer:has(> yt-formatted-string[title="Mixes"])',
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
          'ytm-chip-cloud-chip-renderer:has(> .chip-container[aria-label="Mixes"])',
          // Video
          'ytm-rich-item-renderer:has(> ytm-radio-renderer)',
          // Search result
          'ytm-compact-radio-renderer',
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

    if (config.hideSearchSuggestions) {
      let shelfTitles = [
        'Channels new to you',
        'For you',
        'From related searches',
        'People also watched',
        'Popular today',
        'Previously watched',
      ].map(title => `[data-title="${title}"]`).join(', ')
      if (desktop) {
        hideCssSelectors.push(
          // Shelf with specific title
          `ytd-shelf-renderer:is(${shelfTitles})`,
          // People also search for
          '#contents.ytd-item-section-renderer > ytd-horizontal-card-list-renderer',
        )
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
          // Chip in Search
          'yt-chip-cloud-chip-renderer:has(> yt-formatted-string[title="Shorts"])',
          // Shelf in Search
          'ytd-reel-shelf-renderer',
          // Video in search results
          'ytd-video-renderer:has(a[href^="/shorts"])',
          // Tab in channel profiles
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
          // Video in search results
          'ytm-video-with-context-renderer:has(a[href^="/shorts"])',
          // Tab in channel profiles
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
          // Above Related videos
          '#player-ads',
          // In Related videos
          '#items > ytd-ad-slot-renderer',
        )
      }
      if (mobile) {
        hideCssSelectors.push(
          // Bottom of screen promo
          '.mealbar-promo-renderer',
          // Search results
          'ytm-item-section-renderer:has(> lazy-list > ad-slot-renderer)',
          // Directly under video
          'ytm-companion-slot:has(> ytm-companion-ad-renderer)',
        )
      }
    }

    if (config.hideStreamed) {
      if (desktop) {
        hideCssSelectors.push(
          // Grid item (Home, Subscriptions)
          'ytd-rich-item-renderer:has(#video-title-link[aria-label*="views Streamed"])',
          // List item (Search)
          'ytd-video-renderer:has(#video-title[aria-label*="views Streamed"])',
          // Related video
          'ytd-compact-video-renderer:has(#video-title[aria-label*="views Streamed"])',
        )
      }
      if (mobile) {
        hideCssSelectors.push(
          // Grid item
          'ytm-rich-item-renderer:has(.yt-core-attributed-string[aria-label*="views Streamed"])',
          // Search result
          'lazy-list > ytm-video-with-context-renderer:has(.yt-core-attributed-string[aria-label*="views Streamed"])',
        )
      }
    }

    if (config.hideUpcoming) {
      if (desktop) {
        hideCssSelectors.push(
          // Grid item
          'ytd-rich-item-renderer:has(ytd-thumbnail-overlay-time-status-renderer[overlay-style="UPCOMING"])',
          // List item
          'ytd-video-renderer:has(ytd-thumbnail-overlay-time-status-renderer[overlay-style="UPCOMING"])',
        )
      }
      if (mobile) {
        hideCssSelectors.push('ytm-video-with-context-renderer:has(ytm-thumbnail-overlay-time-status-renderer[data-style="UPCOMING"])')
      }
    }

    if (config.hideWatched) {
      let thresholds = []
      for (let percent = Number(config.hideWatchedThreshold); percent <= 100; percent++) {
        thresholds.push(`[style*="${percent}%"]`)
      }
      if (desktop) {
        hideCssSelectors.push(
          // Grid item
          `ytd-rich-item-renderer:has(#progress:is(${thresholds.join(', ')}))`,
          // List item
          `ytd-video-renderer:has(#progress:is(${thresholds.join(', ')}))`,
          // Related video
          `ytd-compact-video-renderer:has(#progress:is(${thresholds.join(', ')}))`,
        )
      }
      if (mobile) {
        hideCssSelectors.push(`ytm-video-with-context-renderer:has(.thumbnail-overlay-resume-playback-progress:is(${thresholds.join(', ')}))`)
      }
    }

    if (desktop) {
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
          // The last item in the full screen menu is Open App
          '#menu .multi-page-menu-system-link-list:has(+ ytm-privacy-tos-footer-renderer)',
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
  if (desktop) {
    let $autoplayButton = await getElement('button[data-tooltip-target-id="ytp-autonav-toggle-button"]', {
      name: 'Autoplay button',
      stopIf: currentUrlIsNot(getCurrentUrl()),
    })
    if (!$autoplayButton) return

    // On desktop, initial Autoplay button HTML has style="display: none" and is
    // always checked on. Once it's displayed, we can determine its real state
    // and take action if needed.
    pageObservers.push(
      observeElement($autoplayButton, () => {
        if ($autoplayButton.style.display == 'none') return

        if ($autoplayButton.querySelector('.ytp-autonav-toggle-button[aria-checked="true"]')) {
          log('turning Autoplay off')
          $autoplayButton.click()
        } else {
          log('Autoplay is already off')
        }

        disconnectPageObserver('Autoplay button style')
      }, 'Autoplay button style', {attributes: true, attributeFilter: ['style']})
    )
  }

  if (mobile) {
    // Appearance of the Autoplay button may be delayed until interaction
    let $customControl = await getElement('#player-control-container > ytm-custom-control', {
      name: 'Autoplay control container',
      stopIf: currentUrlIsNot(getCurrentUrl()),
    })
    if (!$customControl) return

    pageObservers.push(
      observeElement($customControl, () => {
        if ($customControl.childElementCount == 0) return

        let $autoplayButton = /** @type {HTMLElement} */ ($customControl.querySelector('button.ytm-autonav-toggle-button-container'))
        if (!$autoplayButton) return

        if ($autoplayButton.getAttribute('aria-pressed') == 'true') {
          log('turning Autoplay off')
          $autoplayButton.click()
        } else {
          log('Autoplay is already off')
        }

        disconnectPageObserver('Autoplay control container')
      }, 'Autoplay control container')
    )
  }
}

const observeOpenAppMenuItem = (() => {
  /** @param {Element} $el */
  function tagOpenAppMenuItem($el) {
    let menuItems = $el.querySelectorAll('ytm-menu-item')
    for (let $menuItem of menuItems) {
      if ($menuItem.textContent == 'Open App') {
        log('tagging Open App item')
        $menuItem.classList.add('open-app-menu-item')
        break
      }
    }
  }

  /**
   * Depending on resolution, mobile menus appear in <bottom-sheet-container>
   * (lower res) or as a child of <body> (higher res).
   */
  return async function observeOpenAppMenuItem() {
    let $body = await getElement('body', {
      name: '<body>',
      stopIf: currentUrlIsNot(getCurrentUrl()),
    })
    if (!$body) return

    pageObservers.push(
      observeElement($body, (mutations) => {
        for (let mutation of mutations) {
          for (let $el of mutation.addedNodes) {
            if ($el instanceof Element && $el.id == 'menu') {
              tagOpenAppMenuItem($el)
              return
            }
          }
        }
      }, '<body> for Open App menu item')
    )

    let $bottomSheet = await getElement('bottom-sheet-container', {
      name: 'bottom sheet',
      stopIf: currentUrlIsNot(getCurrentUrl()),
    })
    if (!$bottomSheet) return

    pageObservers.push(
      observeElement($bottomSheet, () => {
        if ($bottomSheet.childElementCount > 0) {
          tagOpenAppMenuItem($bottomSheet)
        }
      }, 'bottom sheet for Open App menu item')
    )
  }
})()

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
      observeOpenAppMenuItem()
    }
  }
  else if (location.pathname == '/results') {
    tweakSearchPage()
  }
}

function redirectShort() {
  log('redirecting Short to normal player')
  let videoId = location.pathname.split('/').at(-1)
  let search = location.search ? location.search.replace('?', '&') : ''
  location.replace(`/watch?v=${videoId}${search}`)
}

async function tweakSearchPage() {
  if (desktop && config.hideSearchSuggestions) {
    /**
     * Add a data-title attribute to a shelf so we can hide it by title
     * @param {HTMLElement} $shelf
     */
    function addTitleToShelf($shelf) {
      let title = $shelf.querySelector('#title').textContent
      $shelf.dataset.title = title
      log('added', title, 'shelf title')
    }

    /** @param {HTMLElement} $section */
    function processSection($section) {
      for (let $shelf of $section.querySelectorAll('ytd-shelf-renderer')) {
        addTitleToShelf(/** @type {HTMLElement} */ ($shelf))
      }
    }

    let $sections = await getElement('ytd-search ytd-section-list-renderer #contents', {
      name: 'search result sections container',
      stopIf: () => !location.pathname.startsWith('/results'),
    })
    if (!$sections) return

    let $firstSection = /** @type {HTMLElement} */ ($sections.querySelector('ytd-item-section-renderer #contents'))
    if (!$firstSection) {
      warn('first search result section not found')
      return
    }

    // The first section has some initial content
    processSection($firstSection)
    // More content is added to the first section during initial load and when
    // the search is changed.
    pageObservers.push(
      observeElement($firstSection, (mutations) => {
        for (let mutation of mutations) {
          for (let $addedNode of mutation.addedNodes) {
            if ($addedNode.nodeName == 'YTD-SHELF-RENDERER') {
              log('new shelf added to first section')
              addTitleToShelf(/** @type {HTMLElement} */ ($addedNode))
            }
          }
        }
      }, 'first search result section contents')
    )
    // New sections are added when more results are loaded
    pageObservers.push(
      observeElement($sections, (mutations) => {
        for (let mutation of mutations) {
          for (let $addedNode of mutation.addedNodes) {
            if ($addedNode.nodeName == 'YTD-ITEM-SECTION-RENDERER') {
              log('new search result section added')
              processSection(/** @type {HTMLElement} */ ($addedNode))
            }
          }
        }
      }, 'search result sections container')
    )
  }

  if (mobile) {
    if (config.hideOpenApp) {
      observeOpenAppMenuItem()
    }
    /*
    WIP for anything which needs to observe mobile search results
    if (config.hideSearchSuggestions) {
      // When the search is changed all the section list renderer's contents are replaced
      let $sections = await getElement('ytm-search ytm-section-list-renderer', {
        name: 'search result sections container',
        stopIf: () => !location.pathname.startsWith('/results'),
      })
      if (!$sections) return
    }
    */
  }
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