/* eslint-disable no-console */
import { sendMessage } from 'webext-bridge';
import { createApp } from 'vue';
import { setupApp, Logger } from '~/common/utils';
import { MessageType } from '~/bridge';
import type {
  BaseMessage,
  BaseRequest,
  PublicKeyRequest,
  PublicKeyResponse,
  ChallengeRequest,
  ChallengeResponse,
  ErrorResponse
} from '~/bridge';
import App from './App.vue';

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  Logger.info('content-script initiated', null, 'content-script');

  // ======== ssasy logic - request channel ========

  /**
   * The maximum duration of a session in milliseconds. After this time, the
   * session will be reset. This is to mitigate the risk of denial of service
   * attacks.
   */
  const SESSION_DURATION = 1000 * 60 * 2; // 2 minute(s)

  /**
	 * The origin of the website that started a message. There can only be one
	 * website at a time that is requesting a public key to mitigate the risk
	 * of denial of service attacks.
	 */
  let currentSession: BaseRequest | undefined = undefined;

  /**
   * Sets the current session and starts a timer to reset the session
   * after the maximum duration has passed.
   * 
   * @see SESSION_DURATION
   * 
   * @param request - the request that started the session
   */
  function setSession(request: BaseRequest) {
    currentSession = request;

    Logger.info('starting session timer', null, 'content-script')
    // start a timer
    setTimeout(async () => {

      Logger.info('resetting session timer', null, 'content-script')
      resetSession();

    }, SESSION_DURATION);
  }

  /**
   * Resets the current session to undefined.
   */
  function resetSession(message?: string) {
    currentSession = undefined;

    closeSessionWindow(message);
  }

  /**
   * Closes the popup window that is requesting a user response.
   */
  async function closeSessionWindow(message?: string){
    if(message) {
      const error: ErrorResponse = {
        type: MessageType.RESPONSE_ERROR,
        error: message
      };

      sendMessage('close-request-tab', error);
    }

    else {
      sendMessage('close-request-tab', undefined);
    }
  }

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

    try {
      /**
			 * the request require user interaction
			 */
      const isUserRequest = (
        request.type === MessageType.REQUEST_PUBLIC_KEY ||
				request.type === MessageType.REQUEST_SOLUTION
      );

      if (isUserRequest && currentSession === undefined) {
        
        setSession(request);
      } 
      
      else if (isUserRequest && currentSession !== undefined) {
        throw new Error(
          'Another website is already requesting a response. Please try again later.'
        );
      }

      // listen for [extension ping] and returns a response
      if (request.type === MessageType.REQUEST_PING) {
        const response: BaseMessage = {
          type: MessageType.RESPONSE_PING
        };

        // response to website
        return window.postMessage(response, request.origin);
      }

      // listen for [public key request] from website
      if (request.type === MessageType.REQUEST_PUBLIC_KEY) {
        Logger.info('SSASy Channel', 'public key request received', 'content-script')

        const keyRequest: PublicKeyRequest = {
          origin: request.origin,
          mode: event.data.mode,
          type: MessageType.REQUEST_PUBLIC_KEY
        };

        const response: PublicKeyResponse | ErrorResponse = await sendMessage(
          MessageType.REQUEST_PUBLIC_KEY,
          keyRequest
        );

        if (response.type === MessageType.RESPONSE_ERROR) {
          throw new Error(response.error);
        } else {
          // send message to website
          window.postMessage(response, request.origin);
          
          // reset session
          return resetSession();
        }
      }

      // listen for [challenge request] from website
      if (request.type === MessageType.REQUEST_SOLUTION) {
        Logger.info('SSASy Channel', 'solution request received', 'content-script')

        const challengeRequest: ChallengeRequest = {
          origin: request.origin,
          type: MessageType.REQUEST_SOLUTION,
          mode: event.data.mode,
          challenge: event.data.challenge
        };

        const response: ChallengeResponse | ErrorResponse = await sendMessage(
          MessageType.REQUEST_SOLUTION,
          challengeRequest
        );

        if (response.type === MessageType.RESPONSE_ERROR) {
          throw new Error(response.error);
        } else {
          // send message to website
          window.postMessage(response, request.origin);
          
          // reset session
          return resetSession();
        }
      }

    } catch (error) {
      const errorMessage = (error as Error).message || `Failed to process request ${request.type}`;
      Logger.error('SSASy Channel', errorMessage, 'content-script');

      // response to website
      const errorResponse: ErrorResponse = {
        type: MessageType.RESPONSE_ERROR,
        error: errorMessage
      };

      // send message to website
      window.postMessage(errorResponse, request.origin);

      // reset session
      resetSession();
    }
  });

  // ======== ssasy logic - request channel ========

  // mount component to context window
  const container = document.createElement('div');
  const root = document.createElement('div');
  const styleEl = document.createElement('link');
  const shadowDOM = container.attachShadow?.({ mode: __DEV__ ? 'open' : 'closed' }) || container;
  styleEl.setAttribute('rel', 'stylesheet');
  styleEl.setAttribute('href', browser.runtime.getURL('dist/contentScripts/style.css'));
  shadowDOM.appendChild(styleEl);
  shadowDOM.appendChild(root);
  document.body.appendChild(container);
  const app = createApp(App);
  setupApp(app, { blockVuetify: true });
  app.mount(root);
})();
