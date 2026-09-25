const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')

const root = path.resolve(__dirname, '..')
const source = name => fs.readFileSync(path.join(root, name), 'utf8')
const copy = value => JSON.parse(JSON.stringify(value))
const marker = '__cpfyInitialSettingsApplied'
const id = 'test-extension@example.org'

function event() {
  const listeners = new Set()
  return {
    listeners,
    addListener: listener => listeners.add(listener),
    removeListener: listener => listeners.delete(listener),
    emit: (...args) => [...listeners].map(listener => listener(...args)),
  }
}

function background(options = {}) {
  const state = {local: copy(options.local || {}), policy: copy(options.policy || {}), ...options}
  const writes = []
  const warnings = []
  const icons = []
  let managedReads = 0
  let localReads = 0
  const runtime = {
    id,
    lastError: undefined,
    onMessage: event(),
    onInstalled: event(),
    getManifest: () => ({manifest_version: options.mv || 2, version: '1.35.2'}),
  }
  const onChanged = event()
  function reply(callback, value, error) {
    runtime.lastError = error ? {message: error} : undefined
    callback(value)
    runtime.lastError = undefined
  }
  function select(object, keys) {
    if (keys == null) return copy(object)
    if (typeof keys == 'string') return Object.hasOwn(object, keys) ? {[keys]: copy(object[keys])} : {}
    return {...keys, ...copy(object)}
  }
  const local = {
    onChanged,
    get(keys, callback) {
      if (typeof keys == 'function') [callback, keys] = [keys, null]
      localReads++
      queueMicrotask(() => reply(callback,
        state.invalidLocalResult ? undefined : select(state.local, keys),
        state.failLocalRead || (state.failFinalRead && localReads > 1) ? 'Local read failed' : null))
    },
    set(items, callback = () => {}) {
      queueMicrotask(() => {
        if (state.failWrites > 0) {
          state.failWrites--
          reply(callback, undefined, 'Local write failed')
          return
        }
        writes.push(copy(items))
        const changes = Object.fromEntries(Object.entries(items).map(([key, value]) =>
          [key, {oldValue: state.local[key], newValue: value}]))
        Object.assign(state.local, copy(items))
        onChanged.emit(changes)
        reply(callback)
      })
    },
  }
  const managed = {
    get(keys, callback) {
      managedReads++
      queueMicrotask(() => {
        state.beforeManagedResult?.(state)
        reply(callback, select(state.policy, keys), state.managedFailure)
      })
    },
  }
  const action = {
    setTitle() {},
    setIcon(value) { icons.push(value) },
    setBadgeText() {},
  }
  const chrome = {
    runtime, storage: {local, managed: options.noManaged ? undefined : managed},
    i18n: {getMessage: name => name}, browserAction: action, action, tabs: {create() {}},
  }
  const context = vm.createContext({
    chrome, location: {protocol: options.safari ? 'safari-web-extension:' : 'moz-extension:'},
    console: {log() {}, warn(...args) { warnings.push(args.join(' ')) }},
  })
  vm.runInContext(source('background.js'), context, {filename: 'background.js'})
  function request() {
    return new Promise(resolve => {
      const results = runtime.onMessage.emit({type: 'get-initial-config'}, {id}, value => resolve(value && copy(value)))
      assert.deepEqual(results, [true])
    })
  }
  return {state, writes, warnings, icons, chrome, context, request,
    managedReads: () => managedReads, localReads: () => localReads}
}

const seed = {enabled: true, hideShorts: true, redirectShorts: true, blockAds: false}

test('fresh profile receives only declared settings and the marker in one write', async () => {
  const app = background({policy: {initialSettings: seed, unrelated: 'not copied'}})
  assert.deepEqual(await app.request(), {...seed, [marker]: true})
  assert.deepEqual(app.writes, [{...seed, [marker]: true}])
  assert.equal(app.managedReads(), 1)
})

test('startup seeds without requiring a popup, YouTube tab, or onInstalled event', async () => {
  const app = background({policy: {initialSettings: {enabled: false}}})
  await new Promise(resolve => setImmediate(resolve))
  assert.deepEqual(app.state.local, {enabled: false, [marker]: true})
  assert.match(app.icons.at(-1).path[16], /disabled/)
})

test('50 concurrent readers share one initialization', async () => {
  const app = background({policy: {initialSettings: seed}})
  const results = await Promise.all(Array.from({length: 50}, () => app.request()))
  assert.ok(results.every(value => value.hideShorts === true))
  assert.equal(app.writes.length, 1)
  assert.equal(app.managedReads(), 1)
})

test('local changes are returned instead of a cached seed', async () => {
  const app = background({policy: {initialSettings: seed}})
  await app.request()
  app.state.local.hideShorts = false
  app.state.local.enabled = false
  app.state.policy.initialSettings.disableHomeFeed = true
  assert.equal((await app.request()).hideShorts, false)
  assert.equal((await app.request()).enabled, false)
  assert.equal(Object.hasOwn(app.state.local, 'disableHomeFeed'), false)
  assert.equal(app.writes.length, 1)
})

test('restart/update and changed or removed policy preserve user settings', async () => {
  const first = background({policy: {initialSettings: seed}})
  await first.request()
  first.state.local.hideShorts = false
  delete first.state.local.redirectShorts
  for (const policy of [{initialSettings: {...seed, disableHomeFeed: true}}, {}]) {
    const next = background({local: copy(first.state.local), policy})
    assert.deepEqual(await next.request(), first.state.local)
    assert.deepEqual(next.writes, [])
    assert.equal(next.managedReads(), 0)
  }
})

for (const local of [
  {hideShorts: false}, {enabled: false}, {version: 'desktop'}, {collapsedOptions: []},
  {hiddenChannels: [{name: 'Private', url: '/@private'}]}, {legacyUnknownState: 0}, {[marker]: true},
]) {
  test(`existing profile is untouched: ${Object.keys(local)[0]}`, async () => {
    const app = background({local, policy: {initialSettings: seed}})
    assert.deepEqual(await app.request(), local)
    assert.deepEqual(app.writes, [])
    assert.equal(app.managedReads(), 0)
  })
}

test('another context writing during policy retrieval makes the profile ineligible', async () => {
  const app = background({policy: {initialSettings: seed},
    beforeManagedResult(state) { state.local.hideShorts = false }})
  assert.deepEqual(await app.request(), {hideShorts: false})
  assert.deepEqual(app.writes, [])
})

for (const options of [
  {}, {noManaged: true}, {managedFailure: 'Managed storage manifest not found'},
  {policy: {someOtherPolicy: true}}, {mv: 3, noManaged: true}, {safari: true, noManaged: true},
]) {
  test(`unmanaged/unavailable storage stays functional: ${JSON.stringify(options)}`, async () => {
    const app = background(options)
    assert.deepEqual(await app.request(), {})
    assert.deepEqual(app.writes, [])
  })
}

for (const payload of [
  null, [], 'settings', true,
  {hideShorts: 'true'}, {enabled: 1}, {hideShorts: null},
  {enforceTheme: 'purple'}, {minimumGridItemsPerRow: 4},
  {hideWatchedThreshold: 85}, {hideWatchedThreshold: '101'}, {hideWatchedThreshold: 'NaN'},
  {snapshotQuality: '1.1'}, {snapshotQuality: ''}, {snapshotQuality: 0.92},
  {hiddenChannels: []}, {collapsedOptions: []}, {version: 'desktop'},
  {debug: true}, {unknownKey: true}, {constructor: true}, {[marker]: true},
  JSON.parse('{"__proto__":{"polluted":true}}'),
]) {
  test(`invalid payload is rejected without a partial write: ${JSON.stringify(payload)}`, async () => {
    const app = background({policy: {initialSettings: payload}})
    assert.deepEqual(await app.request(), {})
    assert.deepEqual(app.writes, [])
    assert.ok(app.warnings.some(value => /initialSettings/.test(value)))
  })
}

test('one invalid key rejects otherwise valid settings as well', async () => {
  const app = background({policy: {initialSettings: {...seed, hiddenChannels: []}}})
  assert.deepEqual(await app.request(), {})
  assert.deepEqual(app.writes, [])
})

test('a corrected invalid policy can seed an untouched profile after restart', async () => {
  const first = background({policy: {initialSettings: {hideShorts: 'true'}}})
  await first.request()
  const corrected = background({local: first.state.local, policy: {initialSettings: seed}})
  assert.deepEqual(await corrected.request(), {...seed, [marker]: true})
})

test('explicit empty initialSettings records completion', async () => {
  const app = background({policy: {initialSettings: {}}})
  assert.deepEqual(await app.request(), {[marker]: true})
})

test('all supported enum values and numeric-string boundaries validate', () => {
  const app = background({noManaged: true})
  const enums = vm.runInContext('INITIAL_SETTINGS_ENUMS', app.context)
  for (const [key, values] of Object.entries(enums)) {
    for (const value of values) assert.equal(app.context.validateInitialSettings({[key]: value})[key], value)
  }
  for (const value of ['0', '85', '100']) app.context.validateInitialSettings({hideWatchedThreshold: value})
  for (const value of ['0', '0.92', '1', '1.0']) app.context.validateInitialSettings({snapshotQuality: value})
})

for (const failure of ['failLocalRead', 'invalidLocalResult', 'failFinalRead']) {
  test(`failed local read is never treated as an empty profile: ${failure}`, async () => {
    const app = background({policy: {initialSettings: seed}, [failure]: true})
    assert.equal(await app.request(), null)
    assert.deepEqual(app.writes, [])
    assert.deepEqual(app.state.local, {})
  })
}

test('failed local write leaves no marker and permits a subsequent retry', async () => {
  const app = background({policy: {initialSettings: seed}, failWrites: 1})
  assert.equal(await app.request(), null)
  assert.deepEqual(app.state.local, {})
  assert.deepEqual(await app.request(), {...seed, [marker]: true})
  assert.equal(app.writes.length, 1)
})

test('clearing all extension storage creates a fresh eligible profile', async () => {
  const app = background({policy: {initialSettings: seed}})
  await app.request()
  const next = background({policy: {initialSettings: {hideShorts: false}}})
  assert.deepEqual(await next.request(), {hideShorts: false, [marker]: true})
})

test('runtime handler ignores unrelated messages and other extension IDs', () => {
  const app = background({noManaged: true})
  const unexpected = () => assert.fail('Unexpected response')
  assert.deepEqual(app.chrome.runtime.onMessage.emit({type: 'something-else'}, {id}, unexpected), [undefined])
  assert.deepEqual(app.chrome.runtime.onMessage.emit({type: 'get-initial-config'}, {id: 'other'}, unexpected), [undefined])
})

function client(name, {fallback = false} = {}) {
  let respond
  let reads = 0
  const listeners = new Map()
  const writes = []
  const messages = []
  const channels = []
  const appended = []
  const makeElement = () => ({
    elements: {}, classList: {add() {}, toggle() {}}, textContent: '', open: false,
    addEventListener(type, callback) { listeners.set(type, callback) },
    removeEventListener() {}, contains: () => false, appendChild() {},
  })
  const form = makeElement()
  const elements = new Map()
  const element = key => {
    if (!elements.has(key)) elements.set(key, makeElement())
    return elements.get(key)
  }
  const window = {addEventListener(type, callback) { listeners.set(`window:${type}`, callback) },
    matchMedia: () => ({matches: false})}
  const runtime = {
    lastError: undefined,
    sendMessage(message, callback) {
      assert.equal(message.type, 'get-initial-config')
      respond = value => callback(value)
      if (fallback) {
        runtime.lastError = {message: 'Background unavailable'}
        callback(undefined)
        runtime.lastError = undefined
      }
    },
  }
  const chrome = {runtime, i18n: {getMessage: key => key}, storage: {local: {
    get(callback) { reads++; callback({enabled: false, hideShorts: false}) },
    set(changes, callback) { writes.push(changes); callback?.() },
    onChanged: event(),
  }}}
  class BroadcastChannel {
    constructor() { this.listeners = new Map(); channels.push(this) }
    addEventListener(type, callback) { this.listeners.set(type, callback) }
    postMessage(message) { messages.push(copy(message)) }
  }
  const context = vm.createContext({chrome, window, BroadcastChannel,
    navigator: {userAgent: 'Mozilla/5.0 Firefox/155.0'},
    document: {body: makeElement(), querySelector: key => key == 'form' ? form : element(key),
      querySelectorAll: () => [], getElementById: element, createElement: makeElement,
      head: {appendChild: node => appended.push(node)}},
    console: {log() {}, warn() {}},
  })
  vm.runInContext(source(name), context, {filename: name})
  const init = () => listeners.get('window:message')({source: window,
    data: {type: 'init', channelName: 'test', configKeys: ['enabled', 'hideShorts']}})
  return {context, listeners, writes, messages, channels, appended, init,
    respond: value => respond(value), reads: () => reads}
}

test('YouTube bridge waits for seed, then filters metadata and enables writers', () => {
  const page = client('content.js')
  page.init()
  assert.equal(page.reads(), 0)
  assert.deepEqual(page.messages, [])
  assert.equal(page.channels[0].listeners.size, 0)
  page.respond({...seed, [marker]: true})
  assert.deepEqual(page.messages, [{type: 'initial', siteConfig: {enabled: true, hideShorts: true}}])
  assert.equal(page.channels[0].listeners.size, 1)
  page.channels[0].listeners.get('message')({data: {hideShorts: false}})
  assert.equal(page.writes[0].hideShorts, false)
})

test('options do not enable change handlers until initialization returns', () => {
  const options = client('options.js')
  assert.equal(options.listeners.has('change'), false)
  assert.equal(options.reads(), 0)
  options.respond({...seed, [marker]: true})
  assert.equal(options.listeners.has('change'), true)
  assert.equal(vm.runInContext('optionsConfig.blockAds', options.context), false)
  options.listeners.get('change')({target: {name: 'hideShorts', type: 'checkbox', checked: false}})
  assert.equal(options.writes[0].hideShorts, false)
})

test('embed waits for initialization before applying CSS', () => {
  const embed = client('embed.js')
  assert.equal(embed.appended.length, 0)
  assert.equal(embed.reads(), 0)
  embed.respond({enabled: true, hideEmbedPauseOverlay: false})
  assert.equal(embed.appended.length, 1)
  assert.doesNotMatch(embed.appended[0].textContent, /ytp-pause-overlay-container/)
})

for (const name of ['content.js', 'options.js', 'embed.js']) {
  test(`${name} falls back to local reads if background messaging fails`, () => {
    const page = client(name, {fallback: true})
    if (name == 'content.js') page.init()
    assert.equal(page.reads(), 1)
  })
}

test('allowlist covers every normal public preference but excludes profile state', () => {
  const options = client('options.js')
  const app = background({noManaged: true})
  const defaults = vm.runInContext('defaultConfig', options.context)
  const excluded = new Set(['collapsedOptions', 'hiddenChannels', 'version'])
  for (const [key, value] of Object.entries(defaults)) {
    if (excluded.has(key)) continue
    assert.equal(app.context.validateInitialSettings({[key]: value})[key], value, key)
  }
  const booleanKeys = vm.runInContext('[...INITIAL_SETTINGS_BOOLEAN_KEYS]', app.context)
  for (const key of booleanKeys) assert.equal(typeof defaults[key], 'boolean', key)
})
