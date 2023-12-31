// ==UserScript==
// @name        Control Panel for YouTube
// @description Hide unwanted content on YouTube
// @namespace   https://github.com/insin/control-panel-for-youtube/
// @match       https://www.youtube.com/*
// @match       https://m.youtube.com/*
// @version     1
// ==/UserScript==
let debug = true
let isSafari = navigator.userAgent.includes('Safari/') && !/Chrom(e|ium)\//.test(navigator.userAgent)
let mobile = location.hostname == 'm.youtube.com'
let desktop = !mobile
let version = mobile ? 'mobile' : 'desktop'

//#region Config
/** @type {import("./types").Config} */
let config = {
  hideLive: false,
  hideShorts: true,
  hideStreamed: false,
  hideUpcoming: false,
  redirectShorts: true,
}
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

function log(...args) {
  if (debug) {
    console.log('🙋', ...args)
  }
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
  if (name) {
    if (options.childList && callback.length > 0) {
      log(`observing ${name}`, $element)
    } else {
      log (`observing ${name}`)
    }
  }

  let observer = new MutationObserver(callback)
  callback([], observer)
  observer.observe($element, options)
  return observer
}
//#endregion

//#region CSS
const configureCss = (() => {
  let $style

  return function configureCss() {
    if ($style == null) {
      $style = addStyle()
    }
    let cssRules = []
    let hideCssSelectors = []

    if (config.hideLive) {
      if (desktop) {
        hideCssSelectors.push('ytd-rich-item-renderer:has(ytd-thumbnail[is-live-video])')
      }
      if (mobile) {
        hideCssSelectors.push('ytm-video-with-context-renderer:has(ytm-thumbnail-overlay-time-status-renderer[data-style="LIVE"])')
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
        )
      }
    }

    if (config.hideStreamed) {
      if (desktop) {
        hideCssSelectors.push('ytd-rich-item-renderer:has(a#video-title-link[aria-label*="views Streamed"])')
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
function observeTitle() {
  let $title = document.querySelector('title')
  observeElement($title, () => {
    redirectShort()
  }, '<title>')
}

function redirectShort() {
  if (config.redirectShorts && location.pathname.startsWith('/shorts/')) {
    log('redirecting Short to normal player')
    let videoId = location.pathname.split('/').at(-1)
    let search = location.search ? location.search.replace('?', '&') : ''
    location.replace(`/watch?v=${videoId}${search}`)
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
  redirectShort()
}

if (
  typeof GM == 'undefined' &&
  typeof chrome != 'undefined' &&
  typeof chrome.storage != 'undefined'
) {
  chrome.storage.local.get((storedConfig) => {
    Object.assign(config, storedConfig)
    log('initial config', {config, version})
    chrome.storage.onChanged.addListener((changes) => {
      let configChanges = Object.fromEntries(
        Object.entries(changes).map(([key, {newValue}]) => [key, newValue])
      )
      Object.assign(config, configChanges)
      configChanged(configChanges)
    })
    main()
  })
}
else {
  main()
}
//#endregion