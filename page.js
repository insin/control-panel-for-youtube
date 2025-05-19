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
  'af-ZA': {
    ORIGINAL: 'oorspronklike',
  },
  'am-ET': {
    ORIGINAL: 'የመጀመሪያ',
  },
  'ar': {
    ORIGINAL: 'أصلي',
  },
  'as-IN': {
    ORIGINAL: 'মূল',
  },
  'az-Latn-AZ': {
    ORIGINAL: 'orijinal',
  },
  'be-BY': {
    ORIGINAL: 'арыгінальны',
  },
  'bg-BG': {
    ORIGINAL: 'оригинален',
  },
  'bn-BD': {
    ORIGINAL: 'মূল',
  },
  'bs-Latn-BA': {
    ORIGINAL: 'original',
  },
  'ca-ES': {
    ORIGINAL: 'original',
  },
  'cs-CZ': {
    ORIGINAL: 'původní',
  },
  'da-DK': {
    ORIGINAL: 'originalt',
  },
  'de-DE': {
    ORIGINAL: 'Original',
  },
  'el-GR': {
    ORIGINAL: 'πρωτότυπο',
  },
  'en': {
    ORIGINAL: 'original',
  },
  'es-419': {
    ORIGINAL: 'original',
  },
  'es-ES': {
    ORIGINAL: 'original',
  },
  'es-US': {
    ORIGINAL: 'original',
  },
  'et-EE': {
    ORIGINAL: 'algne',
  },
  'eu-ES': {
    ORIGINAL: 'jatorrizkoa',
  },
  'fa-IR': {
    ORIGINAL: 'اصلی',
  },
  'fil-PH': {
    ORIGINAL: 'orihinal',
  },
  'fr-CA': {
    ORIGINAL: 'originale',
  },
  'fr-FR': {
    ORIGINAL: 'original',
  },
  'gl-ES': {
    ORIGINAL: 'orixinal',
  },
  'gu-IN': {
    ORIGINAL: 'ઑરિજિનલ',
  },
  'he-IL': {
    ORIGINAL: 'מקור',
  },
  'hi-IN': {
    ORIGINAL: 'मूल',
  },
  'hr-HR': {
    ORIGINAL: 'izvorno',
  },
  'hu-HU': {
    ORIGINAL: 'eredeti',
  },
  'hy-AM': {
    ORIGINAL: 'բնօրինակ',
  },
  'id-ID': {
    ORIGINAL: 'asli',
  },
  'is-IS': {
    ORIGINAL: 'upprunalegt',
  },
  'it-IT': {
    ORIGINAL: 'originale',
  },
  'ja-JP': {
    ORIGINAL: 'オリジナル',
  },
  'ka-GE': {
    ORIGINAL: 'ორიგინალია',
  },
  'kk-KZ': {
    ORIGINAL: 'түпнұсқа',
  },
  'km-KH': {
    ORIGINAL: 'ដើម',
  },
  'kn-IN': {
    ORIGINAL: 'ಮೂಲ',
  },
  'ko-KR': {
    ORIGINAL: '원본',
  },
  'ky-KG': {
    ORIGINAL: 'түпнуска',
  },
  'lo-LA': {
    ORIGINAL: 'ຕົ້ນສະບັບ',
  },
  'lt-LT': {
    ORIGINAL: 'pradinis',
  },
  'lv-LV': {
    ORIGINAL: 'oriģināls',
  },
  'mk-MK': {
    ORIGINAL: 'оригинален',
  },
  'ml-IN': {
    ORIGINAL: 'ഒറിജിനൽ',
  },
  'mn-MN': {
    ORIGINAL: 'эх хувь',
  },
  'mr-IN': {
    ORIGINAL: 'मूळ',
  },
  'ms-MY': {
    ORIGINAL: 'asal',
  },
  'my-MM': {
    ORIGINAL: 'မူရင်း',
  },
  'nb-NO': {
    ORIGINAL: 'original',
  },
  'ne-NP': {
    ORIGINAL: 'मूल',
  },
  'nl-NL': {
    ORIGINAL: 'Originele',
  },
  'or-IN': {
    ORIGINAL: 'ମୂଳ',
  },
  'pa-Guru-IN': {
    ORIGINAL: 'ਮੂਲ',
  },
  'pl-PL': {
    ORIGINAL: 'oryginalny',
  },
  'pt-BR': {
    ORIGINAL: 'original',
  },
  'pt-PT': {
    ORIGINAL: 'original',
  },
  'ro-RO': {
    ORIGINAL: 'original',
  },
  'ru-RU': {
    ORIGINAL: 'оригинальная',
  },
  'si-LK': {
    ORIGINAL: 'මුල්',
  },
  'sk-SK': {
    ORIGINAL: 'pôvodná',
  },
  'sl-SI': {
    ORIGINAL: 'Izvirnik',
  },
  'sq-AL': {
    ORIGINAL: 'origjinale',
  },
  'sr-Cyrl-RS': {
    ORIGINAL: 'оригинална',
  },
  'sr-Latn-RS': {
    ORIGINAL: 'originalna',
  },
  'sw-TZ': {
    ORIGINAL: 'halisi',
  },
  'ta-IN': {
    ORIGINAL: 'அசல்',
  },
  'te-IN': {
    ORIGINAL: 'అసలైనది',
  },
  'th-TH': {
    ORIGINAL: 'เสียงต้นฉบับ',
  },
  'tr-TR': {
    ORIGINAL: 'orijinal',
  },
  'uk-UA': {
    ORIGINAL: 'оригінал',
  },
  'ur-PK': {
    ORIGINAL: 'اصل',
  },
  'uz-Latn-UZ': {
    ORIGINAL: 'original',
  },
  'vi-VN': {
    ORIGINAL: 'gốc',
  },
  'zh-Hans-CN': {
    ORIGINAL: '原始',
  },
  'zh-Hant-HK': {
    ORIGINAL: '原聲',
  },
  'zh-Hant-TW': {
    ORIGINAL: '原文',
  },
  'zu-ZA': {
    ORIGINAL: 'yokuqala',
  },
}

const langCodes = lang.split('-')
  .map((_, index, parts) => parts.slice(0, parts.length - index).join('-'))
  .filter(langCode => Object.hasOwn(locales, langCode))
  .concat('en')

/**
 * @param {import("./types").PageLocaleKey} code
 * @returns {string}
 */
function getString(code) {
  for (let langCode of langCodes) {
    if (Object.hasOwn(locales[langCode], code)) {
      return locales[langCode][code]
    }
  }
}

async function alwaysUseOriginalAudio() {
  let $player = document.querySelector('#movie_player')
  // @ts-ignore
  let playerState = $player.getPlayerState?.()
  if (playerState != null && playerState != 1) {
    log('alwaysUseOriginalAudio: waiting for video to start playing')
    await new Promise((resolve) => {
      function onStateChange(playerState) {
        if (playerState == 1) {
          log('alwaysUseOriginalAudio: video started playing')
          $player.removeEventListener('onStateChange', onStateChange)
          resolve()
        }
      }
      $player.addEventListener('onStateChange', onStateChange)
    })
  }
  // @ts-ignore
  let tracks = $player?.getAvailableAudioTracks?.()
  if (!tracks || tracks.length <= 1) {
    log('alwaysUseOriginalAudio: no alternative tracks available')
    return
  }

  let originalTrackName
  let originalTrack = tracks.find((track) => {
    for (let prop in track) {
      if (Object.prototype.toString.call(track[prop]) == '[object Object]' &&
          track[prop].id &&
          track[prop].name &&
          track[prop].name.includes(getString('ORIGINAL'))) {
        originalTrackName = track[prop].name
        return true
      }
    }
  })
  if (!originalTrack) {
    warn('alwaysUseOriginalAudio: could not find original track', tracks)
    return
  }

  // @ts-ignore
  let activeTrack = $player.getAudioTrack?.()
  if (activeTrack && activeTrack.id == originalTrack.id) {
    log('alwaysUseOriginalAudio: already using original track')
    return
  }

  log('alwaysUseOriginalAudio: switching to original audio track', originalTrackName)
  // @ts-ignore
  $player.setAudioTrack?.(originalTrack)
}

window.addEventListener('message', (e) => {
  if (e.source !== window) return
  let message = e.data
  debug = Boolean(message?.debug)
  if (message?.feature == 'alwaysUseOriginalAudio') alwaysUseOriginalAudio()
})

}()
