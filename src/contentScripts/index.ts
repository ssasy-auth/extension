/* eslint-disable no-console */
import { sendMessage } from 'webext-bridge'
import { createApp } from 'vue'
import { setupApp, Logger } from '~/common/utils'
import { MessageType, PublicKeyRequest } from '~/common/logic'
import type { 
  BaseMessage,
  BaseRequest,
  PublicKeyResponse,
  ChallengeRequest,
  ChallengeResponse,
  ErrorResponse
} from '~/common/logic'
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
    
    const request: BaseRequest = {
      origin: event.origin,
      type: event.data.type
    };
    
    Logger.info('received website request', request, 'content-script');
    
    try {
      // listen for [extension ping] and returns a response
      if(request.type === MessageType.REQUEST_PING) {
        const response: BaseMessage = {
          type: MessageType.RESPONSE_PING
        };

        // response to website
        return window.postMessage(response, request.origin);
      }

      // listen for [public key request] from website
      if (request.type === MessageType.REQUEST_PUBLIC_KEY) {
        const keyRequest: PublicKeyRequest = {
          origin: request.origin,
          type: MessageType.REQUEST_PUBLIC_KEY
        }
        
        const response: PublicKeyResponse | ErrorResponse = await sendMessage(
          MessageType.REQUEST_PUBLIC_KEY, 
          keyRequest
        );

        if(response.type === MessageType.RESPONSE_ERROR) {
          throw new Error(response.error);
        } else {
          
          // send message to website
          return window.postMessage(response, request.origin);
        }
      }

      // listen for [challenge request] from website
      if (request.type === MessageType.REQUEST_SOLUTION) {
        const challengeRequest: ChallengeRequest = {
          origin: request.origin,
          type: MessageType.REQUEST_SOLUTION,
          challenge: event.data.challenge
        }

        const response: ChallengeResponse | ErrorResponse = await sendMessage(
          MessageType.REQUEST_SOLUTION,
          challengeRequest
        );

        if(response.type === MessageType.RESPONSE_ERROR) {
          throw new Error(response.error);
        } else {
          // send message to website
          return window.postMessage(response, request.origin);
        }

      }
      
    } catch (error) {
      const errorMessage = (error as Error).message || `Failed to process request ${request.type}`
      Logger.error('SSASy Channel', errorMessage, 'content-script');

      // response to website
      const errorResponse: ErrorResponse = {
        type: MessageType.RESPONSE_ERROR,
        error: errorMessage
      }

      window.postMessage(errorResponse, request.origin);
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
