const fs = require('fs')
const path = require('path')

const userAgent =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'

let downloadScript = `#!/bin/bash

cd "$(dirname "$0")"

user_agent=${quoteForShell(userAgent)}

downloads=(
`

for (let file of fs.readdirSync('./desktop')) {
  if (!file.endsWith('.html')) continue

  let localeCode = file.slice(0, -'.html'.length)
  let html = fs.readFileSync(path.join('desktop', file), 'utf8')
  let match = html.match(/"PLAYER_JS_URL":"((?:\\.|[^"\\])+)"/)

  if (!match) {
    console.log('could not find PLAYER_JS_URL', {file, localeCode})
    continue
  }

  let playerJsUrl = JSON.parse(`"${match[1]}"`)
  if (playerJsUrl.startsWith('/')) {
    playerJsUrl = `https://www.youtube.com${playerJsUrl}`
  }

  downloadScript += `  ${quoteForShell(`${localeCode}|${playerJsUrl}`)}\n`
}

downloadScript += `)

for download in "\${downloads[@]}"; do
  locale="\${download%%|*}"
  url="\${download#*|}"
  output="\${locale}.js"
  tmp="\${output}.tmp"

  result=$(
    curl \\
      --silent \\
      --show-error \\
      -A "$user_agent" \\
      -L \\
      -w "%{http_code} %{size_download}" \\
      -o "$tmp" \\
      "$url"
  )
  status="\${result%% *}"
  size="\${result#* }"

  if [[ "$status" == 2* ]]; then
    mv "$tmp" "$output"
  else
    rm -f "$tmp"
  fi

  printf "%-18s %s %10s bytes\\n" "$locale" "$status" "$size"
  sleep 2
done
`

fs.writeFileSync('./player-js/download.sh', downloadScript, 'utf8')
fs.chmodSync('./player-js/download.sh', 0o755)

function quoteForShell(value) {
  return `'${value.replace(/'/g, `'\\''`)}'`
}
