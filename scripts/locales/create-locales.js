const fs = require('fs')
const path = require('path')

const {sortProperties} = require('../lib')

/** @type {Record<string, Record<string, string>>} */
const locales = JSON.parse(fs.readFileSync('./base-locales.json', 'utf-8'))

// These codes are from YouTube's ytcfg.msgs object
let template = {
  SHORTS: 'SHORTS_TAB_LABEL',
}

for (let file of fs.readdirSync('./mobile')) {
  let localeCode = file.split('.')[0]
  locales[localeCode] ??= {}
  let locale = locales[localeCode]
  let src = fs.readFileSync(path.join('mobile', file), {encoding: 'utf8'})
  for (let [key, code] of Object.entries(template)) {
    let match = src.match(new RegExp(`"${code}":("[^"]+")`))
    if (match) {
      locale[key] = JSON.parse(match[1])
    } else {
      console.log('no match', {file, key, code})
    }
  }
  locales[localeCode] = sortProperties(locale)
}

fs.writeFileSync(
  'locales.js',
  `const locales = ${JSON.stringify(locales, null, 2)}`,
  'utf8'
)
