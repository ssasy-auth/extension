/* eslint-disable no-console */
import { sendMessage } from 'webext-bridge'
import { createApp } from 'vue'
import { setupApp } from '~/logic/common-setup'
import { SSASY_MESSAGE, SsasyMessage } from '~/logic'
import App from './App.vue'

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  console.info('[vitesse-webext] Hello world from content script')

  // ======== ssasy logic - request channel ========

  let requestMessage: SsasyMessage | undefined = undefined;

  /**
   * Listen for public key requests from websites. For every request,
   * ask the user to approve/deny the request and return the response.
   * 
   */
  window.addEventListener('message', async (event: MessageEvent) => {
    console.info('[ext-content-script] received website message', event);

    // define message
    requestMessage = {
      origin: event.origin,
      data: event.data
    };

    // listen for public key request from website
    if (requestMessage.data.type === SSASY_MESSAGE.REQUEST_PUBLIC_KEY) {
      const responseMessage: SsasyMessage = await sendMessage(
        SSASY_MESSAGE.REQUEST_PUBLIC_KEY, 
        requestMessage as any
      ) as unknown as SsasyMessage;

      // send message to website
      window.postMessage(responseMessage.data, requestMessage.origin);

      return;
    }

    // TODO listen for solution request from website
    if (requestMessage.data.type === SSASY_MESSAGE.REQUEST_SOLUTION) {
      throw new Error('not implemented');
    }
  });

  // ======== ssasy logic - request channel ========

  // mount component to context window
  const container = document.createElement('div')
  const root = document.createElement('div')
  const styleEl = document.createElement('link')
  const shadowDOM = container.attachShadow?.({ mode: __DEV__ ? 'open' : 'closed' }) || container
  styleEl.setAttribute('rel', 'stylesheet')
  styleEl.setAttribute('href', browser.runtime.getURL('dist/contentScripts/style.css'))
  shadowDOM.appendChild(styleEl)
  shadowDOM.appendChild(root)
  document.body.appendChild(container)
  const app = createApp(App)
  setupApp(app)
  app.mount(root)
})()
