export type Config = {
  version: Version
  enabled: boolean
  disableAutoplay: boolean
  hideChat: boolean
  hideComments: boolean
  hideLive: boolean
  hideRelated: boolean
  hideShorts: boolean
  hideSponsored: boolean
  hideStreamed: boolean
  hideUpcoming: boolean
  redirectShorts: boolean
  // Desktop only
  hideEndCards: boolean
  hideEndVideos: boolean
  unstickHeader: boolean
  // Mobile only
  hideExploreButton: boolean
  hideOpenApp: boolean
}

export type Version = 'mobile' | 'desktop'