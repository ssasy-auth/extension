/* eslint-disable no-console */
import { sendMessage } from 'webext-bridge'
import { createApp } from 'vue'
import { setupApp, Logger } from '~/common/utils'
import { ExtensionMessage, SsasyMessage, MessageData } from '~/common/logic'
import App from './App.vue'

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  Logger.info('content-script initiated', null, 'content-script')

  // ======== ssasy logic - request channel ========

  let requestMessage: SsasyMessage | undefined = undefined;

  /**
   * Listen for public key requests from websites. For every request,
   * ask the user to approve/deny the request and return the response.
   * 
   */
  window.addEventListener('message', async (event: MessageEvent) => {
    Logger.info('received website message', event, 'content-script');

    // define message
    requestMessage = {
      origin: event.origin,
      data: event.data
    };
    console.info('[ext-content-script] received website message', requestMessage);
    
    try {
      // listen for extension ping
      if(requestMessage.data.type === ExtensionMessage.RequestPing) {
        const message: SsasyMessage = {
          origin: requestMessage.origin,
          data: {
            type: ExtensionMessage.ResponsePing
          }
        }

        console.info('[ext-content-script] sending ping response', message);

        // response to website
        return window.postMessage(message.data, requestMessage.origin);
      }

      // listen for public key request from website
      if (requestMessage.data.type === ExtensionMessage.RequestPublicKey) {
        const responseMessage: SsasyMessage = await sendMessage(
          ExtensionMessage.RequestPublicKey, 
        requestMessage as any
        ) as unknown as SsasyMessage;

        // replcae request type with response type
        requestMessage.data.type = ExtensionMessage.ResponsePublicKey;

        // send message to website
        return window.postMessage(responseMessage.data, requestMessage.origin);
      }

      // TODO listen for solution request from website
      if (requestMessage.data.type === ExtensionMessage.RequestSolution) {
        throw new Error('not implemented');
      }
      
    } catch (error) {
      console.error('[ext-content-script] error', error);

      // response to website
      const messageData: MessageData = {
        type: ExtensionMessage.ResponseError,
        description: (error as Error).message || `Failed to process request ${requestMessage?.data.type}`
      }

      window.postMessage(messageData, requestMessage?.origin);
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
