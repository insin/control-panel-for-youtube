const fs = require('fs')

const semver = require('semver')

const manifestPaths = ['./manifest.mv2.json', './manifest.mv3.json', './Safari/Shared (Extension)/Resources/manifest.json']
const optionsPath = './options.html'
const safariProjectPath = './safari/Control Panel for YouTube.xcodeproj/project.pbxproj'

let currentVersion = JSON.parse(fs.readFileSync(manifestPaths[0], {encoding: 'utf8'})).version
let nextVersion = process.argv[2]

if (semver.valid(nextVersion)) {
  if (!semver.satisfies(nextVersion, `>${currentVersion}`)) {
    console.log(`next version must be >${currentVersion}`)
    process.exit(1)
  }
}
else if (nextVersion == 'patch' || nextVersion == 'minor' || nextVersion == 'major') {
  nextVersion = semver.inc(currentVersion, nextVersion)
}
else {
  console.log(`
Usage:
  npm run release (patch|minor|major)
  npm run release 1.2.3
`.trim())
  process.exit(1)
}

for (let manifestPath of manifestPaths) {
  fs.writeFileSync(
    manifestPath,
    fs.readFileSync(manifestPath, {encoding: 'utf8'})
      .replace(/"version": "[^"]+"/, `"version": "${nextVersion}"`),
    {encoding: 'utf8'}
  )
}

fs.writeFileSync(
  optionsPath,
  fs.readFileSync(optionsPath, {encoding: 'utf8'})
    .replace(/id="version">[^<]+</, `id="version">v${nextVersion}<`),
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