export type Channel = {
  name: string
  url?: string
}

export type CustomMutationObserver = MutationObserver & {name: string, onDisconnect?: () => void}

export type Disconnectable = {name: string, disconnect: () => void}

export type EmbedConfig = {
  enabled: boolean
  hideEmbedEndVideos: boolean
  hideEmbedPauseOverlay: boolean
  hideEmbedShareButton: boolean
}

export type Locale = {
  [key in LocaleKey]?: string
}

export type LocaleKey =
  | 'DOWNLOAD'
  | 'FOR_YOU'
  | 'HIDE_CHANNEL'
  | 'MIXES'
  | 'MUTE'
  | 'NEXT_VIDEO'
  | 'PREVIOUS_VIDEO'
  | 'SHORTS'
  | 'STREAMED_TITLE'
  | 'TELL_US_WHY'

export type OptionsConfig = EmbedConfig & SiteConfig

export type SiteConfig = {
  debug?: boolean,
  debugManualHiding?: boolean,
  enabled: boolean
  version?: Version
  disableAutoplay: boolean
  disableHomeFeed: boolean
  hiddenChannels: Channel[]
  hideChannels: boolean
  hideComments: boolean
  hideHiddenVideos: boolean
  hideHomeCategories: boolean
  hideLive: boolean
  hideMetadata: boolean
  hideMixes: boolean
  hideNextButton: boolean
  hideRelated: boolean
  hideShorts: boolean
  hideSponsored: boolean
  hideStreamed: boolean
  hideUpcoming: boolean
  hideVoiceSearch: boolean
  hideWatched: boolean
  hideWatchedThreshold: string
  redirectShorts: boolean
  skipAds: boolean
  // Desktop only
  downloadTranscript: boolean
  fillGaps: boolean
  hideChat: boolean
  hideEndCards: boolean
  hideEndVideos: boolean
  hideMerchEtc: boolean
  hideSubscriptionsLatestBar: boolean
  hideSuggestedSections: boolean
  tidyGuideSidebar: boolean
  // Mobile only
  hideExploreButton: boolean
  hideOpenApp: boolean
  hideSubscriptionsChannelList: boolean
  mobileGridView: boolean
}

export type Version = 'mobile' | 'desktop'