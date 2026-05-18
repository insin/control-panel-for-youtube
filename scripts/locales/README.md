## Updating Locales

### Get locale files from YouTube

> Tweak `desktop/download.sh` and `mobile/download.sh` first if locales have changed.

```sh
(cd desktop && ./download.sh)
(cd mobile && ./download.sh)
node create-player-js-curl-config.js
./player-js/download.sh
```

### Create locale object for page.js

Run `node create-locales.js` to create `locales.js`.

Open it, save to format it with Prettier, then use its contents to update `page.js`.
