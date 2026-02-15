import fs from 'node:fs'

import clipboard from 'clipboardy'

let captions = {
  "subs": {
    "en": "Improved Subscriptions page, which acts more like an inbox of videos",
    "ja": "ビデオの受信箱のように機能する、改善されたサブスクリプションページ",
    "zh_CN": "改进的订阅页面，更像是一个视频收件箱",
    "fr": "Page d'abonnements améliorée, agissant comme une boîte de réception pour les vidéos",
  },
  "ads": {
    "en": "Video ads are blocked and other promoted content is hidden",
    "ja": "動画広告はブロックされ、他のプロモーションコンテンツは非表示になります",
    "zh_CN": "视频广告将被拦截，其他推广内容将被隐藏",
    "fr": "Les publicités vidéo sont bloquées et les autres contenus promus sont masqués"
  },
  "search": {
    "en": "Nothing but search results on the Search page, no suggested sections",
    "ja": "検索ページでは検索結果のみ表示され、提案されたセクションは表示されません",
    "zh_CN": "搜索页面仅显示搜索结果，不包含推荐内容",
    "fr": "Uniquement les résultats de recherche sur la page Recherche, aucune section suggérée",
  },
  "home": {
    "en": "Hide non-video content on the Home page and improve YouTube's built-in hiding",
    "ja": "ホームページの非動画コンテンツを非表示にし、YouTubeの組み込み非表示機能を改善します",
    "zh_CN": "隐藏主页上的非视频内容，并改进YouTube的内置隐藏功能",
    "fr": "Masquer le contenu non vidéo sur la page d'accueil et améliorer la fonction de masquage intégrée de YouTube",
  },
  "disengage": {
    "en": "Disable related videos, the Home timeline and other algorithmic content",
    "ja": "関連動画、ホームタイムライン、およびその他のアルゴリズムコンテンツを無効にします",
    "zh_CN": "禁用相关视频、主页时间线和其他算法推荐内容",
    "fr": "Désactiver les vidéos associées, le fil d'accueil et les autres contenus algorithmiques",
  },
  "embedded": {
    "en": "Hide algorithmic recommendations when viewing YouTube videos embedded in other sites",
    "ja": "他のサイトに埋め込まれたYouTube動画を表示する際にアルゴリズム推薦を非表示にします",
    "zh_CN": "在其他网站观看嵌入的YouTube视频时隐藏算法推荐",
    "fr": "Masquer les recommandations algorithmiques lors du visionnage de vidéos YouTube intégrées sur d'autres sites",
  }
}

let extraTranslations = {
  "desktopVersion": {
    "en": " (desktop version)",
    "ja": "（デスクトップ版）",
    "zh_CN": "（桌面版）",
    "fr": " (version bureau)",
  },
  "mobileVersion": {
    "en": " (mobile version)",
    "ja": "（モバイル版）",
    "zh_CN": "（手机版）",
    "fr": " (version mobile)",
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

${messages.ads}:

• ${messages.blockAds}
• ${messages.hideSponsored}
• ${messages.hideMerchEtc}${messages.desktopVersion}

${messages.recentChanges}:

• ${messages.restoreSidebarSubscriptionsLink}${messages.desktopVersion}
• ${messages.revertSidebarOrder}${messages.desktopVersion}
• ${messages.revertGiantRelated}${messages.desktopVersion}
• ${messages.displaySubscriptionsGridAsList}${messages.desktopVersion}
• ${messages.displayHomeGridAsList}${messages.desktopVersion}

${messages.newVideoPlayerUI}:

• ${messages.playerRemoveDelhiExperimentFlags}${messages.desktopVersion} - ${messages.playerRemoveDelhiExperimentFlagsNote}
• ${messages.playerHideFullScreenControls}
• ${messages.playerHideFullScreenMoreVideos}
• ${messages.playerControlsBg}${messages.desktopVersion} - ${messages.blur} / ${messages.transparent}
• ${messages.restoreMiniplayerButton}${messages.desktopVersion}
• ${messages.playerFixFullScreenButton}${messages.desktopVersion}
• ${messages.playerHideFullScreenTitle}${messages.desktopVersion}
• ${messages.playerHideFullScreenVoting}${messages.desktopVersion}

${messages.annoyances}:

• ${messages.hideAI}
• ${messages.removePink}
• ${messages.hideInfoPanels}
• ${messages.hidePremiumUpsells}
• ${messages.hideExperiencingInterruptions}${messages.desktopVersion}
• ${messages.disableVideoPreviews}${messages.desktopVersion}
• ${messages.disableThemedHover}${messages.desktopVersion}
• ${messages.pauseChannelTrailers}${messages.desktopVersion}
• ${messages.allowBackgroundPlay}${messages.mobileVersion}
• ${messages.hideOpenApp}${messages.mobileVersion}

${messages.videoLists}:

• ${messages.hideSuggestedSections}
• ${messages.hideLive}
• ${messages.hideStreamed}
• ${messages.hideMixes}
• ${messages.hidePlaylists}
• ${messages.hideMoviesAndTV}
• ${messages.hideUpcoming}
• ${messages.hideMembersOnly}
• ${messages.hideCollaborations}
• ${messages.hideLowViews}
• ${messages.hideAutoDubbed} - ${messages.hideAutoDubbedNote}
• ${messages.hideWatched}
• ${messages.hideHiddenVideos} - ${messages.hideHiddenVideosNote}
• ${messages.hideChannels} - ${messages.hideChannelsNote}
• ${messages.disableHomeFeed}
• ${messages.searchThumbnailSize}${messages.desktopVersion}
• ${messages.minimumGridItemsPerRow}${messages.desktopVersion}
• ${messages.hideHomePosts}${messages.mobileVersion}

${messages.videoPages}:

• ${messages.disableAutoplay}
• ${messages.disableAmbientMode}
• ${messages.hideRelated}
• ${messages.hideNextButton}
• ${messages.hideChannelWatermark}
• ${messages.hideShareThanksClip}
• ${messages.hideAskButton}
• ${messages.hideMetadata}
• ${messages.hideComments}
• ${messages.alwaysUseTheaterMode}${messages.desktopVersion}
• ${messages.fullSizeTheaterMode}${messages.desktopVersion}
• ${messages.disableTheaterBigMode}${messages.desktopVersion}
• ${messages.alwaysUseOriginalAudio}${messages.desktopVersion}
• ${messages.hideEndCards}${messages.desktopVersion}
• ${messages.hideEndVideos}${messages.desktopVersion}
• ${messages.hideJumpAheadButton}${messages.desktopVersion}
• ${messages.hideChat}${messages.desktopVersion}
• ${messages.addTakeSnapshot} (JPEG / PNG) ${messages.desktopVersion}
• ${messages.downloadTranscript}${messages.desktopVersion}

${messages.shorts}:

• ${messages.hideShorts}
• ${messages.redirectShorts}
• ${messages.hideShortsSuggestedActions}
• ${messages.hideShortsRelatedLink}
• ${messages.alwaysShowShortsProgressBar}
• ${messages.stopShortsLooping}
• ${messages.hideShortsRemixButton}${messages.desktopVersion}
• ${messages.hideShortsMetadataUntilHover}${messages.desktopVersion}
• ${messages.minimumShortsPerRow}${messages.desktopVersion}

${messages.uiTweaks}:

• ${messages.showFullVideoTitles}
• ${messages.useSquareCorners}
• ${messages.hideHomeCategories}
• ${messages.hideChannelBanner}
• ${messages.hideVoiceSearch}
• ${messages.enforceTheme}${messages.desktopVersion}
• ${messages.redirectLogoToSubscriptions}${messages.desktopVersion}
• ${messages.tidyGuideSidebar}${messages.desktopVersion}
• ${messages.hideSubscriptionsLatestBar}${messages.desktopVersion}
• ${messages.fixGhostCards}${messages.desktopVersion}
• ${messages.mobileGridView}${messages.mobileVersion}
• ${messages.hideExploreButton}${messages.mobileVersion}
• ${messages.hideSubscriptionsChannelList}${messages.mobileVersion}

${messages.embeddedVideos}:

• ${messages.hideEmbedShareButton}
• ${messages.hideEmbedPauseOverlay}
`.trim()

if (process.argv[3] == 'md') {
  storeDescription = storeDescription
    // Section titles
    .replace(/^([^:\n]+):$/gm, '**$1:**')
    // List items
    // .replace(/•/g, '-')
}

clipboard.writeSync(storeDescription)
console.log(storeDescription)