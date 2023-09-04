/* eslint-disable no-console */
import { sendMessage } from 'webext-bridge';
import { createApp } from 'vue';
import { setupApp, Logger } from '~/utils';
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

  let timeout: NodeJS.Timeout | undefined = undefined;

  /**
 * Resets the current session and broadcasts message to background
 * script to close the popup window.
 */
  function resetSession(config?: { message?: string, error?: boolean }) {
    // reset session
    currentSession = undefined;

    // clear timer
    if (timeout) {
      clearTimeout(timeout);
      
      timeout = undefined;
    }

    const errorResponse: ErrorResponse | undefined = config?.message && config?.error
      ? { type: MessageType.RESPONSE_ERROR, error: config.message } 
      : undefined;

    // log that session ended successfully
    if(!errorResponse) {
      Logger.info(config?.message || 'Session completed.', null, 'content-script');
    }

    // broadcast to close popup
    sendMessage('close-popup', errorResponse);
  }

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

    Logger.info(`starting session timer (${SESSION_DURATION} milliseconds)`, null, 'content-script')
    
    // start a timer
    timeout = setTimeout(async () => {
      Logger.info('resetting session timer', null, 'content-script')
      resetSession({ message: 'Session timed out.', error: true });
    }, SESSION_DURATION);
  }

  /**
   * Listen for public key and challenge-response requests from websites. 
   * For every request, ask the user to approve/deny the request and 
   * return the response.
   */
  window.addEventListener('message', async (event: MessageEvent) => {
    const request: BaseRequest = {
      origin: event.origin,
      type: event.data.type
    };

    const isUserRequest: boolean = (
      request.type === MessageType.REQUEST_PUBLIC_KEY ||
      request.type === MessageType.REQUEST_CHALLENGE_RESPONSE
    );

    try {

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
        Logger.info('Public key request received', null, 'content-script')

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
          return resetSession({ message: 'Public key request session completed.' });
        }
      }

      // listen for [challenge request] from website
      if (request.type === MessageType.REQUEST_CHALLENGE_RESPONSE) {
        Logger.info('Challenge-response request received', null, 'content-script')

        const challengeRequest: ChallengeRequest = {
          origin: request.origin,
          type: MessageType.REQUEST_CHALLENGE_RESPONSE,
          mode: event.data.mode,
          challenge: event.data.challenge
        };

        const response: ChallengeResponse | ErrorResponse = await sendMessage(
          MessageType.REQUEST_CHALLENGE_RESPONSE,
          challengeRequest
        );

        if (response.type === MessageType.RESPONSE_ERROR) {
          throw new Error(response.error);
        } else {
          // send message to website
          window.postMessage(response, request.origin);

          // reset session
          return resetSession({ message: 'Challenge-response session completed.' });
        }
      }

    } catch (error) {
      const errorMessage = (error as Error).message || `Failed to process request ${request.type}`;
      Logger.error('Error', errorMessage, 'content-script');

      // response to website
      const errorResponse: ErrorResponse = {
        type: MessageType.RESPONSE_ERROR,
        error: errorMessage
      };

      // send message to website
      window.postMessage(errorResponse, request.origin);

      // reset session
      resetSession({ message: errorMessage, error: true });
    }
  });

  // ======== ssasy logic - request channel ========

  // mount component to context window
  const root = document.createElement('div');
  const app = createApp(App);
  setupApp(app, { blockVuetify: true, blockPinia: true });
  app.mount(root);
})();
