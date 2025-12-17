export type Channel = {
  name: string
  url?: string
}

export interface CustomMutationObserver extends MutationObserver {
  name: string
  onDisconnect?: () => void
}

export type Disconnectable = {disconnect: () => void}

export type EmbedConfig = {
  enabled: boolean
  debug?: boolean;
  hideEmbedPauseOverlay: boolean
  hideEmbedShareButton: boolean
  hideEndCards: boolean
  hideEndVideos: boolean
  hideInfoPanels: boolean
  removePink: boolean
}

export type Locale = {
  [key in LocaleKey]?: string
}

export type LocaleKey =
  | 'CLIP'
  | 'COLLABORATORS'
  | 'HIDE_CHANNEL'
  | 'MIXES'
  | 'ORIGINAL'
  | 'SHARE'
  | 'SHORTS'
  // This needs to match both innerText and textContent
  | 'STREAMED_METADATA_INNERTEXT_RE'
  | 'STREAMED_TITLE_ARIA_LABEL'
  | 'TAKE_SNAPSHOT'
  | 'TELL_US_WHY'
  | 'THANKS'
  | 'UNHIDE_CHANNEL'

export type OptionsConfig = EmbedConfig & SiteConfig & {
  version?: Version
}

export type SiteConfig = {
  enabled: boolean
  collapsedOptions?: string[]
  debug?: boolean
  debugManualHiding?: boolean
  alwaysShowShortsProgressBar: boolean
  blockAds: boolean
  disableAmbientMode: boolean
  disableAutoplay: boolean
  disableHomeFeed: boolean
  disableTheaterBigMode: boolean
  hiddenChannels: Channel[]
  hideAI: boolean
  hideAskButton: boolean
  hideAutoDubbed: boolean
  hideChannelBanner: boolean
  hideChannelWatermark: boolean
  hideChannels: boolean
  hideCollaborations: boolean
  preventScrollinShorts: boolean
  hideComments: boolean
  hideHiddenVideos: boolean
  hideHomeCategories: boolean
  hideInfoPanels: boolean
  hideLive: boolean
  hideMembersOnly: boolean
  hideMetadata: boolean
  hideMixes: boolean
  hideMoviesAndTV: boolean
  hideNextButton: boolean
  hidePlaylists: boolean
  hidePremiumUpsells: boolean
  hideRelated: boolean
  hideShareThanksClip: boolean
  hideShorts: boolean
  hideShortsMusicLink: boolean
  hideShortsRelatedLink: boolean
  hideShortsSuggestedActions: boolean
  hideSponsored: boolean
  hideStreamed: boolean
  hideSuggestedSections: boolean
  hideUpcoming: boolean
  hideVoiceSearch: boolean
  hideWatched: boolean
  hideWatchedThreshold: string
  playerHideFullScreenControls: boolean
  playerHideFullScreenMoreVideos: boolean
  redirectShorts: boolean
  removePink: boolean
  showFullVideoTitles: boolean
  stopShortsLooping: boolean
  useSquareCorners: boolean
  // Desktop only
  addTakeSnapshot: boolean
  alwaysUseOriginalAudio: boolean
  alwaysUseTheaterMode: boolean
  disableThemedHover: boolean
  disableVideoPreviews: boolean
  downloadTranscript: boolean
  enforceTheme: 'default' | 'device' | 'dark' | 'light',
  fullSizeTheaterMode: boolean
  fullSizeTheaterModeHideHeader: boolean
  hideChat: boolean
  hideChatFullScreen: boolean
  hideEndCards: boolean
  hideEndVideos: boolean
  hideJumpAheadButton: boolean
  hideMerchEtc: boolean
  hideRelatedBelow: boolean
  hideSidebarSubscriptions: boolean
  hideShortsMetadataUntilHover: boolean
  hideShortsRemixButton: boolean
  hideSubscriptionsLatestBar: boolean
  minimumGridItemsPerRow: 'auto' | '3' | '4' | '5' | '6'
  minimumShortsPerRow: 'auto' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12'
  pauseChannelTrailers: boolean
  playerCompactPlayButton: boolean
  playerFixFullScreenButton: boolean
  playerHideFullScreenTitle: boolean
  playerHideFullScreenVoting: boolean
  playerRemoveControlsBg: boolean
  playerRemoveDelhiExperimentFlags: boolean
  redirectLogoToSubscriptions: boolean
  restoreMiniplayerButton: boolean
  restoreSidebarSubscriptionsLink: boolean
  revertGiantRelated: boolean
  revertSidebarOrder: boolean
  searchThumbnailSize: 'large' | 'medium' | 'small'
  snapshotFormat: 'jpeg' | 'png'
  snapshotQuality: string
  tidyGuideSidebar: boolean
  // Mobile only
  allowBackgroundPlay: boolean
  hideExploreButton: boolean
  hideHomePosts: boolean
  hideOpenApp: boolean
  hideSubscriptionsChannelList: boolean
  mobileGridView: boolean
}

export type SiteConfigMessage = {
  type: 'initial' | 'change'
  siteConfig: Partial<SiteConfig>
}

export type Version = 'mobile' | 'desktop'