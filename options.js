document.title = chrome.i18n.getMessage('extensionName')

for (let translationId of [
  'disableAutoplay',
  'enabled',
  'hideComments',
  'hideEndCards',
  'hideEndVideos',
  'hideExploreButton',
  'hideLive',
  'hideOpenApp',
  'hideRelated',
  'hideShorts',
  'hideSponsored',
  'hideStreamed',
  'hideUpcoming',
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

function setFormValue(prop, value) {
  if (!$form.elements.hasOwnProperty(prop)) return

  let $el = /** @type {HTMLInputElement} */ ($form.elements[prop])
  if ($el.type == 'checkbox') {
    $el.checked = value
  } else {
    $el.value = value
  }
}

/** @type {import("./types").Config} */
let defaultConfig = {
  // Default based on platform until the content script runs
  version: /(Android|iP(ad|hone))/.test(navigator.userAgent) ? 'mobile' : 'desktop',
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

/** @type {import("./types").Config} */
let optionsConfig

function updateDisplay() {
  $body.classList.toggle('mobile', optionsConfig.version == 'mobile')
  $body.classList.toggle('desktop', optionsConfig.version == 'desktop')
}

function main() {
  chrome.storage.local.get((storedConfig) => {
    optionsConfig = {...defaultConfig, ...storedConfig}

    for (let [prop, value] of Object.entries(optionsConfig)) {
      setFormValue(prop, value)
    }

    updateDisplay()

    $form.addEventListener('change', (e) => {
      let $el = /** @type {HTMLInputElement} */ (e.target)
      let prop = $el.name
      let value = $el.type == 'checkbox' ? $el.checked : $el.value
      chrome.storage.local.set({[prop]: value})
    })

    chrome.storage.onChanged.addListener((changes) => {
      for (let prop in changes) {
        optionsConfig[prop] = changes[prop].newValue
        if (prop == 'version') {
          updateDisplay()
        } else {
          setFormValue(prop, changes[prop].newValue)
        }
      }
    })
  })
}

main()