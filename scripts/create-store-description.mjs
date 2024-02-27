import fs from 'node:fs'

import clipboard from 'clipboardy'

let extraTranslations = {
  "desktopVersion": {
    "en": " (desktop version)",
    "ja": "（デスクトップ版）"
  },
  "mobileVersion": {
    "en": " (mobile version)",
    "ja": "（モバイル版）"
  }
}

let localeCode = process.argv[2] || 'en'

if (process.argv.some(arg => /^-h|--help$/.test(arg))) {
  console.log(`
Usage:
  npm run create-store-description ja
  npm run create-store-description ja [html|md]
`.trim())
  process.exit(1)
}

// Get translated messages for locale
let locale = JSON.parse(fs.readFileSync(`./_locales/${localeCode}/messages.json`, {encoding: 'utf8'}))
let messages = Object.fromEntries(Object.entries(locale).map(([prop, value]) => ([prop, value.message])))
// Add extra translations
Object.assign(messages, Object.fromEntries(Object.entries(extraTranslations).map(([prop, value]) => [prop, value[localeCode]])))

let storeDescription = `
${messages.features}

${messages.videoLists}:

• ${messages.hideShorts}
• ${messages.hideSponsored}
• ${messages.hideSuggestedSections}
• ${messages.hideLive}
• ${messages.hideStreamed}
• ${messages.hideMixes}
• ${messages.hideUpcoming}
• ${messages.hideWatched}
• ${messages.hideHiddenVideos}
  • ${messages.hideHiddenVideosNote}
• ${messages.hideChannels}
  • ${messages.hideChannelsNote}
• ${messages.disableHomeFeed}
• ${messages.fillGaps}${messages.desktopVersion}

${messages.videoPages}:

• ${messages.skipAds}
• ${messages.disableAutoplay}
• ${messages.hideRelated}
• ${messages.hideNextButton}
• ${messages.hideMetadata}
• ${messages.hideComments}
• ${messages.redirectShorts}
• ${messages.hideEndCards}${messages.desktopVersion}
• ${messages.hideEndVideos}${messages.desktopVersion}
• ${messages.hideMerchEtc}${messages.desktopVersion}
• ${messages.hideChat}${messages.desktopVersion}
• ${messages.downloadTranscript}${messages.desktopVersion}

${messages.uiTweaks}:

• ${messages.hideHomeCategories}
• ${messages.hideVoiceSearch}
• ${messages.tidyGuideSidebar}${messages.desktopVersion}
• ${messages.hideSubscriptionsLatestBar}${messages.desktopVersion}
• ${messages.mobileGridView}${messages.mobileVersion}
• ${messages.hideExploreButton}${messages.mobileVersion}
• ${messages.hideSubscriptionsChannelList}${messages.mobileVersion}
• ${messages.hideOpenApp}${messages.mobileVersion}

${messages.embeddedVideos}:

• ${messages.hideEmbedShareButton}
• ${messages.hideEmbedPauseOverlay}
• ${messages.hideEmbedEndVideos}
`.trim()

if (process.argv[3] == 'html') {
  // XXX This depends _very specifically_ on the way dashes, spaces and newlines
  //     are used in the template string above.
  storeDescription = storeDescription
    // 2 nested items
    .replace(/^• ([^\n]+)\n  • ([^\n]+)\n  • ([^\n]+)/gm, '<li>$1<ul>\n<li>$2</li>\n<li>$3</li></ul></li>')
    // 1 nested item
    .replace(/^• ([^\n]+)\n  • ([^\n]+)/gm, '<li>$1<ul>\n<li>$2</li></ul></li>')
    // No nested items
    .replace(/^• ([^\n]+)/gm, '<li>$1</li>')
    // Section titles
    .replace(/^([^\n<][^\n]+)\n\n/gm, '<strong>$1</strong>\n<ul>\n')
    // Remaining empty lines
    .replace(/^$/gm, '</ul>\n')
    .replace(/$/, '\n</ul>')
}

if (process.argv[3] == 'md') {
  storeDescription = storeDescription
    // Section titles
    .replace(/^([^:\n]+):$/gm, '### $1')
    // List tiems
    .replace(/•/g, '-')
}

clipboard.writeSync(storeDescription)
console.log(storeDescription)