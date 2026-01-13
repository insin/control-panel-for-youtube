#!/bin/bash

url="https://youtube.com"
user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36"

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

mkdir -p desktop
for lang in "${languages[@]}"; do
  echo "$lang"
  curl -A "$user_agent" \
       -H "Accept-Language: ${lang}" \
       -L \
       -o "desktop/${lang}.html" \
       "$url"
  sleep 2
done