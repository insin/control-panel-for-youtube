export type Config = {
  version: Version
  enabled: boolean
  disableAutoplay: boolean
  hideComments: boolean
  hideLive: boolean
  hideMerchEtc: boolean
  hideMetadata: boolean
  hideMixes: boolean
  hideRelated: boolean
  hideSearchSuggestions: boolean
  hideShorts: boolean
  hideSponsored: boolean
  hideStreamed: boolean
  hideUpcoming: boolean
  hideWatched: boolean
  hideWatchedThreshold: string
  redirectShorts: boolean
  // Desktop only
  fillGaps: boolean
  hideChat: boolean
  hideEndCards: boolean
  hideEndVideos: boolean
  tidyGuideSidebar: boolean
  // Mobile only
  hideExploreButton: boolean
  hideOpenApp: boolean
}

export type Version = 'mobile' | 'desktop'