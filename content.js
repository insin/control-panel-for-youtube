/** @type {BroadcastChannel} */
let channel
/** @type {Set<string>} */
let configKeys

window.addEventListener('message', (event) => {
  if (event.source !== window) return
  if (event.data.type != 'init' || !event.data.channelName || !event.data.configKeys) return
  channel = new BroadcastChannel(event.data.channelName)
  configKeys = new Set(event.data.configKeys)
  channel.addEventListener('message', storeConfigChangesFromPageScript)
  chrome.storage.local.get((storedConfig) => {
    let siteConfig = Object.fromEntries(
      Object.entries(storedConfig).filter(([key]) => configKeys.has(key))
    )
    chrome.storage.local.onChanged.addListener(onStorageChanged)
    channel.postMessage({type: 'initial', siteConfig})
  })
})

/** @param {{[key: string]: chrome.storage.StorageChange}} storageChanges */
function onStorageChanged(storageChanges) {
  /** @type {Partial<import("./types").SiteConfig>} */
  let siteConfig = Object.fromEntries(
    Object.entries(storageChanges)
      .filter(([key]) => configKeys.has(key))
      .map(([key, {newValue}]) => [key, newValue])
  )

  // Ignore storage changes which aren't relevant to the page script
  if (Object.keys(siteConfig).length == 0) return

  channel.postMessage({type: 'change', siteConfig})
}

/** @param {MessageEvent<Partial<import("./types").OptionsConfig>>} message */
function storeConfigChangesFromPageScript({data: changes}) {
  chrome.storage.local.onChanged.removeListener(onStorageChanged)
  chrome.storage.local.set(changes, () => {
    chrome.storage.local.onChanged.addListener(onStorageChanged)
  })
}
