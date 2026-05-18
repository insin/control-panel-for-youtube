function show(platform, state) {
  document.body.classList.add(`platform-${platform}`)
  if (typeof state == 'string') {
    document.body.classList.toggle('state-on', state == 'on')
    document.body.classList.toggle('state-off', state == 'off')
    document.body.classList.toggle('state-error', state == 'error')
  }
  else if (platform == 'mac') {
    document.body.classList.add('state-unknown')
  }
}

document.querySelector('button.open-preferences').addEventListener('click', () => {
  // @ts-expect-error
  webkit.messageHandlers.controller.postMessage('open-preferences')
})

document.querySelector('.ad').addEventListener('click', () =>{
  // @ts-expect-error
  webkit.messageHandlers.controller.postMessage('open-ad')
})
