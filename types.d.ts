export type Channel = {
  name: string
  url?: string
}

export type CustomMutationObserver = MutationObserver & {name: string, onDisconnect?: () => void}

export type Disconnectable = {name: string, disconnect: () => void}

export type EmbedConfig = {
  debug?: boolean;
  enabled: boolean
  hideEmbedEndVideos: boolean
  hideEmbedPauseOverlay: boolean
  hideEmbedShareButton: boolean
  hideInfoPanels: boolean
}

export type Locale = {
  [key in LocaleKey]?: string
}

export type LocaleKey =
  | 'CLIP'
  | 'DOWNLOAD'
  | 'FOR_YOU'
  | 'HIDE_CHANNEL'
  | 'MIXES'
  | 'MUTE'
  | 'NEXT_VIDEO'
  | 'OPEN_APP'
  | 'PREVIOUS_VIDEO'
  | 'SHARE'
  | 'SHORTS'
  | 'STREAMED_TITLE'
  | 'TELL_US_WHY'
  | 'THANKS'
  | 'UNHIDE_CHANNEL'

export type OptionsConfig = EmbedConfig & SiteConfig

export type SiteConfig = {
  debug?: boolean,
  debugManualHiding?: boolean,
  enabled: boolean
  version?: Version
  disableAutoplay: boolean
  disableHomeFeed: boolean
  hideAI: boolean
  hiddenChannels: Channel[]
  hideChannels: boolean
  hideComments: boolean
  hideHiddenVideos: boolean
  hideHomeCategories: boolean
  hideInfoPanels: boolean
  hideLive: boolean
  hideMetadata: boolean
  hideMixes: boolean
  hideMoviesAndTV: boolean
  hideNextButton: boolean
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
  alwaysUseTheaterMode: boolean
  downloadTranscript: boolean
  fullSizeTheaterMode: boolean
  hideChat: boolean
  hideEndCards: boolean
  hideEndVideos: boolean
  hideMerchEtc: boolean
  hideMiniplayerButton: boolean
  hideSubscriptionsLatestBar: boolean
  minimumGridItemsPerRow: 'auto' | '3' | '4' | '5' | '6'
  searchThumbnailSize: 'large' | 'medium' | 'small'
  tidyGuideSidebar: boolean
  // Mobile only
  hideExploreButton: boolean
  hideOpenApp: boolean
  hideSubscriptionsChannelList: boolean
  mobileGridView: boolean
}

export type Version = 'mobile' | 'desktop'