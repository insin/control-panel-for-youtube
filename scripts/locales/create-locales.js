const fs = require('fs')
const path = require('path')

const {sortProperties} = require('../lib')

/** @type {Record<string, Record<string, string>>} */
const locales = JSON.parse(fs.readFileSync('./base-locales.json', 'utf-8'))

const desktopMessagesKeys = {
  SHARE: 'SHARE_LABEL',
}

const mobileMessagesKeys = {
  SHORTS: 'SHORTS_TAB_LABEL',
}

const playerJsExtractors = {
  EXPERIENCING_INTERRUPTIONS: (src) => {
    let supportUrl = 'answer/3037019#check_ad_blockers'
    let supportUrlIndex = src.indexOf(supportUrl)
    if (supportUrlIndex == -1) return null

    let start = Math.max(0, supportUrlIndex - 1200)
    let toastSrc = src.slice(start, supportUrlIndex)
    let textMatches = Array.from(
      toastSrc.matchAll(/text:"((?:\\.|[^"\\])+)"/g),
      match => match[1],
    )

    if (textMatches.length < 2) return null

    return JSON.parse(`"${textMatches[textMatches.length - 2]}"`)
  }
}

function removeExtension(file, extension) {
  return file.slice(0, -extension.length)
}

for (let file of fs.readdirSync('./desktop')) {
  if (!file.endsWith('.html')) continue

  let localeCode = removeExtension(file, '.html')
  locales[localeCode] ??= {}
  let locale = locales[localeCode]
  let src = fs.readFileSync(path.join('desktop', file), 'utf8')
  for (let [key, code] of Object.entries(desktopMessagesKeys)) {
    let match = src.match(new RegExp(`"${code}":("[^"]+")`))
    if (match) {
      locale[key] = JSON.parse(match[1])
    } else {
      console.log('no match', {file, key, code})
    }
  }
}

for (let file of fs.readdirSync('./mobile')) {
  if (!file.endsWith('.html')) continue

  let localeCode = removeExtension(file, '.html')
  locales[localeCode] ??= {}
  let locale = locales[localeCode]
  let src = fs.readFileSync(path.join('mobile', file), 'utf8')
  for (let [key, code] of Object.entries(mobileMessagesKeys)) {
    let match = src.match(new RegExp(`"${code}":("[^"]+")`))
    if (match) {
      locale[key] = JSON.parse(match[1])
    } else {
      console.log('no match', {file, key, code})
    }
  }
}

for (let file of fs.readdirSync('./player-js')) {
  if (!file.endsWith('.js')) continue

  let localeCode = removeExtension(file, '.js')
  if (!Object.hasOwn(locales, localeCode)) {
    console.log('skipping player JS for unknown locale', {file, localeCode})
    continue
  }

  let locale = locales[localeCode]
  let src = fs.readFileSync(path.join('player-js', file), 'utf8')
  for (let [key, extract] of Object.entries(playerJsExtractors)) {
    let message = extract(src)
    if (message) {
      locale[key] = message
    } else {
      console.log('no match', {file, key})
    }
  }
}

for (let [localeCode, locale] of Object.entries(locales)) {
  locales[localeCode] = sortProperties(locale)
}

fs.writeFileSync(
  'locales.js',
  `const locales = ${JSON.stringify(locales, null, 2)}`,
  'utf8'
)