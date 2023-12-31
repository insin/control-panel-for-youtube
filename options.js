document.title = chrome.i18n.getMessage('extensionName')

for (let translationId of [
  'hideLive',
  'hideShorts',
  'hideStreamed',
  'hideUpcoming',
  'redirectShorts',
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
  hideLive: false,
  hideShorts: true,
  hideStreamed: false,
  hideUpcoming: false,
  redirectShorts: true,
}

/** @type {import("./types").Config} */
let optionsConfig

chrome.storage.local.get((storedConfig) => {
  optionsConfig = {...defaultConfig, ...storedConfig}

  for (let [prop, value] of Object.entries(optionsConfig)) {
    setFormValue(prop, value)
  }

  $form.addEventListener('change', (e) => {
    let $el = /** @type {HTMLInputElement} */ (e.target)
    let prop = $el.name
    let value = $el.type == 'checkbox' ? $el.checked : $el.value
    chrome.storage.local.set({[prop]: value})
  })

  chrome.storage.onChanged.addListener((changes) => {
    for (let prop in changes) {
      optionsConfig[prop] = changes[prop].newValue
      setFormValue(prop, changes[prop].newValue)
    }
  })
})
