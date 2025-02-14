let debug = false

function log(...args) {
  if (debug) {
    console.log('🛏️', ...args)
  }
}

//#region Default config
/** @type {import("./types").EmbedConfig} */
let config = {
  debug: false,
  enabled: true,
  hideEmbedEndVideos: true,
  hideEmbedPauseOverlay: true,
  hideEmbedShareButton: false,
  hideInfoPanels: false,
  removePink: false,
}
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

    if (config.hideEmbedEndVideos) {
      hideCssSelectors.push('.videowall-endscreen')
    }

    if (config.hideEmbedPauseOverlay) {
      hideCssSelectors.push('.ytp-pause-overlay-container')
    }

    if (config.hideEmbedShareButton) {
      hideCssSelectors.push('.ytp-share-button')
    }

    if (config.hideInfoPanels) {
      hideCssSelectors.push('.ytp-info-panel-preview')
    }

    if (config.removePink) {
      cssRules.push(`
        .ytp-play-progress {
          background-color: #f03 !important;
        }
      `)
    }

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

//#region Main
function main() {
  if (config.enabled) {
    configureCss()
  }
}

/** @param {Partial<import("./types").EmbedConfig>} changes */
function configChanged(changes) {
  if (!changes.hasOwnProperty('enabled')) {
    log('config changed', changes)
    configureCss()
    return
  }

  log(`${changes.enabled ? 'en' : 'dis'}abling extension functionality`)
  configureCss()
}

/** @param {{[key: string]: chrome.storage.StorageChange}} storageChanges */
function onConfigChange(storageChanges) {
  let configChanges = Object.fromEntries(
    Object.entries(storageChanges)
      .filter(([key]) => config.hasOwnProperty(key))
      .map(([key, {newValue}]) => [key, newValue])
  )
  if (Object.keys(configChanges).length == 0) return

  if ('debug' in configChanges) {
    log('disabling debug mode')
    debug = configChanges.debug
    log('enabled debug mode')
    return
  }

  Object.assign(config, configChanges)
  configChanged(configChanges)
}

chrome.storage.local.get((storedConfig) => {
  Object.assign(
    config,
    Object.fromEntries(
      Object.entries(storedConfig).filter(([key]) => config.hasOwnProperty(key))
    )
  )
  debug = config.debug
  log('initial config', config)
  chrome.storage.local.onChanged.addListener(onConfigChange)
  window.addEventListener('unload', () => {
    chrome.storage.local.onChanged.removeListener(onConfigChange)
  }, {once: true})
  main()
})

// XXX chrome.storage.local.get() callback isn't getting called in Safari - run with default settings
if (navigator.userAgent.includes('Safari/') && !/Chrom(e|ium)\//.test(navigator.userAgent)) {
  main()
}
//#endregion