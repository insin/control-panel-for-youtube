const fs = require('fs')

const semver = require('semver')

const contentPath = './content.js'
const manifestPath = './manifest.json'
const safariProjectPath = './safari/Control Panel for YouTube.xcodeproj/project.pbxproj'

let releaseType = process.argv[2]

if (releaseType != 'patch' && releaseType != 'minor' && releaseType != 'major') {
  console.log(`
Usage:
  npm run release (patch|minor|major)
`.trim())
  process.exit(1)
}

let currentVersion = JSON.parse(fs.readFileSync(manifestPath, {encoding: 'utf8'})).version
let nextVersion = semver.inc(currentVersion, releaseType)

fs.writeFileSync(
  contentPath,
  fs.readFileSync(contentPath, {encoding: 'utf8'})
    .replace(/@version     (\d+)/g, (_, current) => `@version     ${Number(current) + 1}`),
  {encoding: 'utf8'}
)

fs.writeFileSync(
  manifestPath,
  fs.readFileSync(manifestPath, {encoding: 'utf8'})
    .replace(/"version": "[^"]+"/, `"version": "${nextVersion}"`),
  {encoding: 'utf8'}
)

fs.writeFileSync(
  safariProjectPath,
  fs.readFileSync(safariProjectPath, {encoding: 'utf8'})
    .replace(/CURRENT_PROJECT_VERSION = (\d+)/g, (_, current) => `CURRENT_PROJECT_VERSION = ${Number(current) + 1}`)
    .replace(/MARKETING_VERSION = [^;]+/g, `MARKETING_VERSION = ${nextVersion}`),
  {encoding: 'utf8'}
)

console.log(`Bumped to v${nextVersion}`)