# [Control Panel for YouTube](https://soitis.dev/control-panel-for-youtube)

[![](https://img.shields.io/itunes/v/6478456678?logo=apple&logoColor=white&label=apple%20app%20store&color=323232)](https://apps.apple.com/us/app/control-panel-for-youtube/id6478456678)
[![](https://img.shields.io/chrome-web-store/v/lodcanccmfbpjjpnngindkkmiehimile?logo=googlechrome&logoColor=white&color=4285F4)](https://chromewebstore.google.com/detail/control-panel-for-youtube/lodcanccmfbpjjpnngindkkmiehimile)
[![](https://img.shields.io/chrome-web-store/users/lodcanccmfbpjjpnngindkkmiehimile?logo=googlechrome&logoColor=white&label=chrome%20users&color=4285F4)](https://chromewebstore.google.com/detail/control-panel-for-youtube/lodcanccmfbpjjpnngindkkmiehimile)
[![](https://img.shields.io/amo/v/control-panel-for-youtube?logo=firefoxbrowser&logoColor=white&label=firefox%20add-ons&color=FF7139)](https://addons.mozilla.org/firefox/addon/control-panel-for-youtube/)
[![](https://img.shields.io/amo/users/control-panel-for-youtube?logo=firefoxbrowser&logoColor=white&label=firefox%20users&color=FF7139)](https://addons.mozilla.org/firefox/addon/control-panel-for-youtube/)
[![](https://raster.shields.io/badge/edge%20add--ons-available-0078d4.png?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyBmaWxsPSIjZmZmIiB2aWV3Qm94PSIwIDAgMTQgMTQiPgogIDxwYXRoIGQ9Ik0zLjMwOCAxLjAxNkE2LjcgNi43IDAgMCAxIDYuOTcuMDAxYzQuNTk1IDAgNy4wMyAzLjM2IDcuMDMgNS45NTJhMy4zNiAzLjM2IDAgMCAxLTMuMzUgMy4zN2MtMi4wNTYgMC0yLjUtLjYyNC0yLjUtLjg3NiAwLS4xMDguMDYyLS4xNzguMTUzLS4yODFsLjAzNi0uMDQxYy4yNjItLjMxNi40MDctLjcxMy40MDktMS4xMjRoLjAwMmMwLTIuMTQtMi4yNTMtMy44NzUtNS4wMzEtMy44NzVhNi4xIDYuMSAwIDAgMC0yLjkzOC43MyA2LjcgNi43IDAgMCAxIDIuNTI3LTIuODRtMy4wOTQgNC4zNC4xLS4wMzNhNC41NyA0LjU3IDAgMCAwLTIuNzgzLS44ODVDMS43MDUgNC40MzguMDAzIDUuNjExIDAgNi45OTd2LjAwNmE3LjAzNSA3LjAzNSAwIDAgMCA1LjcwOCA2Ljg4NCA1LjA3IDUuMDcgMCAwIDEtMi00LjI0MWMwLTEuODA2IDEuMjg0LTMuODEzIDIuNjk0LTQuMjltNi40MjggNS41MTcuMDE0LS4wMmMuMDk0LS4xNC4xOC0uMjY3LjA0OC0uNC0uMTEtLjExLS4yMS0uMDYtLjMyLS4wMDRsLS4wNTQuMDI3YTUuNCA1LjQgMCAwIDEtMi40NjYuNTUzIDQuOTEgNC45MSAwIDAgMS00LjYyLTIuOTY4IDMuNiAzLjYgMCAwIDAtLjQxIDEuNTg1IDMuNjI3IDMuNjI3IDAgMCAwIDMuNjczIDMuOTA0IDUuMTcgNS4xNyAwIDAgMCAyLjk4NS0xLjM1M2MuNDQtLjM5LjgyNi0uODM0IDEuMTUtMS4zMjQiLz4KPC9zdmc%2BCg%3D%3D)](https://microsoftedge.microsoft.com/addons/detail/control-panel-for-youtube/llinnalaegmbpmjonmfbpklchphiabfo) <!-- I don't know why, but SVGs within SVGs don't work, so we have to use a raster image for Edge --> 

[![](icons/icon128.png)](https://soitis.dev/control-panel-for-youtube)

**Control Panel for YouTube is a browser extension which gives you more control over your YouTube experience by adding missing options and UI improvements**

> [!IMPORTANT]
> This is the support repository for Control Panel for YouTube - for installation links, information about the extension, and FAQs, please visit the [Control Panel for YouTube website](https://soitis.dev/control-panel-for-youtube).

Check the latest updates and availability for your browser on the [releases page](https://github.com/insin/control-panel-for-youtube/releases).

Follow [@soitis.dev](https://bsky.app/profile/soitis.dev) on Bluesky for extension news and other announcements.

## Support

To report a bug [create a new Issue](https://github.com/insin/control-panel-for-youtube/issues/new) here on GitHub.

Please include:

- The version of Control Panel for YouTube you're using
- The browser and operating system you're using it on
- Relevant URLs if applicable (e.g. a specific YouTube video a feature isn't working on)
- Relevant screenshots if applicable

If you don't have a GitHub account, you can use the [Browser Extension Feedback & Support form](https://soitis.dev/extensions/feedback) on our website instead, or email [extensions@soitis.dev](mailto:extensions@soitis.dev).

## New translations

If you would like to translate Control Panel for YouTube's options into your language, please create a copy of the English [messages.json](./_locales/en/messages.json) file, translate the `"message"` strings into your language, then create a new Issue or Pull Request with the translated JSON.

Certain features also depend on translations in the `locales` object in [content.js](./content.js#L104), which uses the language code you can find in YouTube's `<html lang="…">` attribute - these _must_ match the text used in the relevant parts of YouTube's UI.

## Thanks

- [@Catastravia](https://github.com/Catastravia) for [improving the Japanese translation](https://github.com/insin/control-panel-for-youtube/issues/22)
- [@movcoa](https://github.com/movcoa) for [providing a Chinese translation](https://github.com/insin/control-panel-for-youtube/issues/67)
- [@tohu-sand](https://github.com/tohu-sand) for [improving the Japanese translation](https://github.com/insin/control-panel-for-youtube/pull/68)
- [@maxchrr](https://github.com/maxchrr) for [providing a French translation](https://github.com/insin/control-panel-for-youtube/pull/86)

## Attribution

Icon adapted from "Floor hatch icon" by [Delapouite](https://delapouite.com/) from [game-icons.net](https://game-icons.net), [CC 3.0 BY](https://creativecommons.org/licenses/by/3.0/)
