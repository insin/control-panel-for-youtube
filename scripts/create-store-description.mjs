import fs from 'node:fs'

import clipboard from 'clipboardy'

let captions = {
  "subs": {
    "en": "Improved Subscriptions page, which acts more like an inbox of videos",
    "ja": "ビデオの受信箱のように機能する、改善されたサブスクリプションページ",
    "zh_CN": "改进的订阅页面，更像是一个视频收件箱",
  },
  "ads": {
    "en": "Video ads can be automatically skipped and other promoted content is hidden",
    "ja": "動画広告は自動的にスキップされ、他のプロモーションコンテンツは非表示になります",
    "zh_CN": "视频广告可自动跳过，其他推广内容将被隐藏",
  },
  "search": {
    "en": "Nothing but search results on the Search page, no suggested sections",
    "ja": "検索ページでは検索結果のみ表示され、提案されたセクションは表示されません",
    "zh_CN": "搜索页面仅显示搜索结果，不包含推荐内容",
  },
  "home": {
    "en": "Hide non-video content on the Home page and improve YouTube's built-in hiding",
    "ja": "ホームページの非動画コンテンツを非表示にし、YouTubeの組み込み非表示機能を改善します",
    "zh_CN": "隐藏主页上的非视频内容，并改进YouTube的内置隐藏功能",
  },
  "disengage": {
    "en": "Disable related videos, the Home timeline and other algorithmic content",
    "ja": "関連動画、ホームタイムライン、およびその他のアルゴリズムコンテンツを無効にします",
    "zh_CN": "禁用相关视频、主页时间线和其他算法推荐内容",
  },
  "embedded": {
    "en": "Hide algorithmic recommendations when viewing YouTube videos embedded in other sites",
    "ja": "他のサイトに埋め込まれたYouTube動画を表示する際にアルゴリズム推薦を非表示にします",
    "zh_CN": "在其他网站观看嵌入的YouTube视频时隐藏算法推荐",
  }
}

let extraTranslations = {
  "desktopVersion": {
    "en": " (desktop version)",
    "ja": "（デスクトップ版）",
    "zh_CN": "（桌面版）",
  },
  "mobileVersion": {
    "en": " (mobile version)",
    "ja": "（モバイル版）",
    "zh_CN": "（手机版）",
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

• ${messages.hideAI}
• ${messages.removePink}

${messages.videoLists}:

• ${messages.hideShorts}
• ${messages.hideSponsored}
• ${messages.hideSuggestedSections}
• ${messages.hideLive}
• ${messages.hideStreamed}
• ${messages.hideMixes}
• ${messages.hideMoviesAndTV}
• ${messages.hideUpcoming}
• ${messages.hideWatched}
• ${messages.hideHiddenVideos}
  • ${messages.hideHiddenVideosNote}
• ${messages.hideChannels}
  • ${messages.hideChannelsNote}
• ${messages.disableHomeFeed}
• ${messages.searchThumbnailSize}${messages.desktopVersion}
• ${messages.minimumGridItemsPerRow}${messages.desktopVersion}
  • ${messages.minimumGridItemsPerRowNote}

${messages.videoPages}:

• ${messages.skipAds}
• ${messages.disableAutoplay}
• ${messages.hideRelated}
• ${messages.hideNextButton}
• ${messages.hideShareThanksClip}
• ${messages.hideMetadata}
• ${messages.hideComments}
• ${messages.redirectShorts}
• ${messages.alwaysUseTheaterMode}${messages.desktopVersion}
• ${messages.fullSizeTheaterMode}${messages.desktopVersion}
• ${messages.hideMiniplayerButton}${messages.desktopVersion}
• ${messages.hideEndCards}${messages.desktopVersion}
• ${messages.hideEndVideos}${messages.desktopVersion}
• ${messages.hideMerchEtc}${messages.desktopVersion}
• ${messages.hideChat}${messages.desktopVersion}
• ${messages.downloadTranscript}${messages.desktopVersion}

${messages.uiTweaks}:

• ${messages.hideInfoPanels}
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