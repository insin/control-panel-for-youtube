export type Channel = {
  name: string
  url?: string
}

export type Config = {
  enabled: boolean
  version: Version
  disableAutoplay: boolean
  hiddenChannels: Channel[]
  hideChannels: boolean
  hideComments: boolean
  hideHiddenVideos: boolean
  hideLive: boolean
  hideMerchEtc: boolean
  hideMetadata: boolean
  hideMixes: boolean
  hideRelated: boolean
  hideShorts: boolean
  hideSponsored: boolean
  hideStreamed: boolean
  hideSuggestedSections: boolean
  hideUpcoming: boolean
  hideVoiceSearch: boolean
  hideWatched: boolean
  hideWatchedThreshold: string
  redirectShorts: boolean
  // Desktop only
  downloadTranscript: boolean
  fillGaps: boolean
  hideChat: boolean
  hideEndCards: boolean
  hideEndVideos: boolean
  tidyGuideSidebar: boolean
  // Mobile only
  hideExploreButton: boolean
  hideOpenApp: boolean
  // Embedded videos
  hideEmbedEndVideos: boolean
  hideEmbedPauseOverlay: boolean
  hideEmbedShareButton: boolean
}

export type Locale = {
  [key in LocaleKey]?: string
}

export type LocaleKey =
  | 'CHANNELS_NEW_TO_YOU'
  | 'DOWNLOAD'
  | 'FOR_YOU'
  | 'FROM_RELATED_SEARCHES'
  | 'HIDE_CHANNEL'
  | 'MIXES'
  | 'PEOPLE_ALSO_WATCHED'
  | 'POPULAR_TODAY'
  | 'PREVIOUSLY_WATCHED'
  | 'SHORTS'
  | 'STREAMED_TITLE'

export type Version = 'mobile' | 'desktop'