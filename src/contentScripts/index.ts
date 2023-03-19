/* eslint-disable no-console */
import { sendMessage } from 'webext-bridge'
import { createApp } from 'vue'
import { setupApp, Logger } from '~/common/utils'
import { MessageType } from '~/common/logic'
import type { GenericRequest, GenericMessage, KeyRequest, KeyResponse, ChallengeRequest, ChallengeResponse } from '~/common/logic'
import App from './App.vue'

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  Logger.info('content-script initiated', null, 'content-script')

  // ======== ssasy logic - request channel ========

  /**
   * Listen for public key requests from websites. For every request,
   * ask the user to approve/deny the request and return the response.
   * 
   */
  window.addEventListener('message', async (event: MessageEvent) => {
    Logger.info('received website message', event, 'content-script');

    // define message
    const request: GenericRequest = {
      origin: event.origin,
      type: event.data.type
    };
    
    try {
      // listen for [extension ping] and returns a response
      if(request.type === MessageType.RequestPing) {
        const response: GenericMessage = {
          type: MessageType.ResponsePing
        };

        // response to website
        return window.postMessage(response, request.origin);
      }

      // listen for [public key request] from website
      if (request.type === MessageType.RequestPublicKey) {
        const keyRequest: KeyRequest = {
          origin: request.origin,
          type: MessageType.RequestPublicKey
        }
        
        const publicKeyResponsetMsg: KeyResponse = await sendMessage(
          MessageType.RequestPublicKey, 
          keyRequest
        );

        // send message to website
        return window.postMessage(publicKeyResponsetMsg, request.origin);
      }

      // listen for [challenge request] from website
      if (request.type === MessageType.RequestSolution) {
        const challengeRequest: ChallengeRequest = {
          origin: request.origin,
          type: MessageType.RequestSolution,
          challenge: event.data.challenge
        }

        const challengeResponse: ChallengeResponse = await sendMessage(
          MessageType.RequestSolution,
          challengeRequest
        );

        // send message to website
        return window.postMessage(challengeResponse, request.origin);
      }
      
    } catch (error) {
      console.error('[ext-content-script] error', error);

      // response to website
      const response: GenericMessage = {
        type: MessageType.ResponseError,
        description: (error as Error).message || `Failed to process request ${request.type}`
      }

      window.postMessage(response, request.origin);
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
