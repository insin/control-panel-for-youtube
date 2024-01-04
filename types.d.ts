export type Config = {
  version: Version
  enabled: boolean
  disableAutoplay: boolean
  hideComments: boolean
  hideLive: boolean
  hideMerchEtc: boolean
  hideMixes: boolean
  hideRelated: boolean
  hideShorts: boolean
  hideSponsored: boolean
  hideStreamed: boolean
  hideUpcoming: boolean
  hideWatched: boolean
  hideWatchedThreshold: string
  redirectShorts: boolean
  // Desktop only
  hideChat: boolean
  hideEndCards: boolean
  hideEndVideos: boolean
  tidyGuideSidebar: boolean
  // Mobile only
  hideExploreButton: boolean
  hideOpenApp: boolean
}

export type Version = 'mobile' | 'desktop'