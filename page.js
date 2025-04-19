void function() {

let debug = false

let mobile = location.hostname == 'm.youtube.com'
let desktop = !mobile
let lang = mobile ? document.body.lang : document.documentElement.lang

function log(...args) {
  if (debug) {
    console.log('📃🙋', ...args)
  }
}

function warn(...args) {
  if (debug) {
    console.log('📃❗️', ...args)
  }
}

/**
 * @type {Record<string, import("./types").PageLocale>}
 */
const locales = {
  'en': {
    ORIGINAL: 'original',
  },
  'ja-JP': {
    ORIGINAL: 'オリジナル',
  },
  'zh-Hans-CN': {
    ORIGINAL: '原始',
  },
}

/**
 * @param {import("./types").PageLocaleKey} code
 * @returns {string}
 */
function getString(code) {
  return (locales[lang] || locales['en'])[code] || locales['en'][code];
}

function alwaysUseOriginalAudio() {
  let $player = document.querySelector('#movie_player')
  // @ts-ignore
  let tracks = $player?.getAvailableAudioTracks?.()
  if (!tracks || tracks.length == 1) return
  let originalTrack = tracks.find((track) => {
    for (let prop in track) {
      if (Object.prototype.toString.call(track[prop]) == '[object Object]' &&
          track[prop].id &&
          track[prop].name &&
          track[prop].name.includes(getString('ORIGINAL'))) {
        return true
      }
    }
  })
  if (!originalTrack) {
    warn('alwaysUseOriginalAudio: could not find original track')
    return
  }

  // @ts-ignore
  let activeTrack = $player.getAudioTrack?.()
  if (activeTrack && activeTrack.id == originalTrack.id) {
    log('alwaysUseOriginalAudio: already using original track')
    return
  }

  log('alwaysUseOriginalAudio: setting original track', activeTrack, '→', originalTrack)
  // @ts-ignore
  $player.setAudioTrack?.(originalTrack)
}

window.addEventListener('message', (e) => {
  let message = e.data
  debug = Boolean(message.debug)
  if (message.feature == 'alwaysUseOriginalAudio') alwaysUseOriginalAudio()
})

}()