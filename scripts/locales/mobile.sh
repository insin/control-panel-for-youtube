#!/bin/bash

url="https://m.youtube.com"
user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"

languages=(
  af-ZA
  am-ET
  ar
  as-IN
  az-Latn-AZ
  be-BY
  bg-BG
  bn-BD
  bs-Latn-BA
  ca-ES
  cs-CZ
  da-DK
  de-DE
  el-GR
  en
  es-419
  es-ES
  es-US
  et-EE
  eu-ES
  fa-IR
  fil-PH
  fr-CA
  fr-FR
  gl-ES
  gu-IN
  he-IL
  hi-IN
  hr-HR
  hu-HU
  hy-AM
  id-ID
  is-IS
  it-IT
  ja-JP
  ka-GE
  kk-KZ
  km-KH
  kn-IN
  ko-KR
  ky-KG
  lo-LA
  lt-LT
  lv-LV
  mk-MK
  ml-IN
  mn-MN
  mr-IN
  ms-MY
  my-MM
  nb-NO
  ne-NP
  nl-NL
  or-IN
  pa-Guru-IN
  pl-PL
  pt-BR
  pt-PT
  ro-RO
  ru-RU
  si-LK
  sk-SK
  sl-SI
  sq-AL
  sr-Cyrl-RS
  sr-Latn-RS
  sw-TZ
  ta-IN
  te-IN
  th-TH
  tr-TR
  uk-UA
  ur-PK
  uz-Latn-UZ
  vi-VN
  zh-Hans-CN
  zh-Hant-HK
  zh-Hant-TW
  zu-ZA
)

mkdir -p mobile
for lang in "${languages[@]}"; do
  echo "$lang"
  curl -A "$user_agent" \
       -H "Accept-Language: ${lang}" \
       -L \
       -o "mobile/${lang}.html" \
       "$url"
  sleep 2
done