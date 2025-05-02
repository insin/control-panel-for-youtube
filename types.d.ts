export type Channel = {
  name: string
  url?: string
}

export type CustomMutationObserver = MutationObserver & {name: string, onDisconnect?: () => void}

export type Disconnectable = {disconnect: () => void}

export type EmbedConfig = {
  debug?: boolean;
  enabled: boolean
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
  | 'DOWNLOAD'
  | 'HIDE_CHANNEL'
  | 'HOME'
  | 'MIXES'
  | 'MUTE'
  | 'NEXT_VIDEO'
  | 'OPEN_APP'
  | 'PREVIOUS_VIDEO'
  | 'SHARE'
  | 'SHORTS'
  // This needs to match both innerText and textContent
  | 'STREAMED_METADATA_INNERTEXT_RE'
  | 'STREAMED_TITLE_ARIA_LABEL'
  | 'TAKE_SNAPSHOT'
  | 'TELL_US_WHY'
  | 'THANKS'
  | 'UNHIDE_CHANNEL'

export type PageLocale = {
  [key in PageLocaleKey]?: string
}

export type PageLocaleKey =
  | 'ORIGINAL'

export type OptionsConfig = EmbedConfig & SiteConfig

export type SiteConfig = {
  debug?: boolean,
  debugManualHiding?: boolean,
  enabled: boolean
  version?: Version
  disableAutoplay: boolean
  disableHomeFeed: boolean
  hiddenChannels: Channel[]
  hideAI: boolean
  hideChannelBanner: boolean
  hideChannels: boolean
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
  hideRelated: boolean
  hideShareThanksClip: boolean
  hideShorts: boolean
  hideSponsored: boolean
  hideStreamed: boolean
  hideSuggestedSections: boolean
  hideUpcoming: boolean
  hideVoiceSearch: boolean
  hideWatched: boolean
  hideWatchedThreshold: string
  redirectShorts: boolean
  removePink: boolean
  skipAds: boolean
  // Desktop only
  addTakeSnapshot: boolean
  alwaysUseOriginalAudio: boolean
  alwaysUseTheaterMode: boolean
  downloadTranscript: boolean
  fullSizeTheaterMode: boolean
  fullSizeTheaterModeHideHeader: boolean
  fullSizeTheaterModeHideScrollbar: boolean
  hideChat: boolean
  hideEndCards: boolean
  hideEndVideos: boolean
  hideMerchEtc: boolean
  hideMiniplayerButton: boolean
  hideSubscriptionsLatestBar: boolean
  minimumGridItemsPerRow: 'auto' | '3' | '4' | '5' | '6'
  pauseChannelTrailers: boolean
  searchThumbnailSize: 'large' | 'medium' | 'small'
  snapshotFormat: 'jpeg' | 'png'
  snapshotQuality: string
  tidyGuideSidebar: boolean
  // Mobile only
  hideExploreButton: boolean
  hideOpenApp: boolean
  hideSubscriptionsChannelList: boolean
  mobileGridView: boolean
}

export type Version = 'mobile' | 'desktop'