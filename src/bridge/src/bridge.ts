/**
 * This file acts as a 'bridge' between the SSASy extension and web applications
 * that want to request a public key or chalenge-response from a user. It exposes
 * three main functions:
 * 
 * - `isExtensionInstalled`: Checks if the SSASy extension is installed in the browser.
 * - `requestPublicKey`: Requests the public key of the user from the SSASy extension.
 * - `requestChallengeResponse`: Requests the solution from the SSASy extension.
 */

import {
  MessageType,
  RequestMode,
  BaseMessage,
  BaseRequest,
  PublicKeyRequest,
  PublicKeyResponse,
  ChallengeRequest,
  ChallengeResponse,
  ErrorResponse
} from './types';

const LOGGING_EMOJI = '🌉';
const LOGGING_CONTEXT = '[ssasy-bridge]';
const LOGGING_PREFIX = `${LOGGING_CONTEXT} ${LOGGING_EMOJI}`;

/**
 * Logs a message to the console.
 */
function _log(message: string, config?: { error?: boolean }) {
  const log = `${LOGGING_PREFIX} ${message}`;

  if (config?.error) {
    console.error(log);
  } else {
    console.info(log);
  }
}

/**
 * Returns true if the browser has the Ssasy extension installed.
 */
async function isExtensionInstalled(): Promise<boolean> {
  // prepare message for extension
  const request: BaseRequest = { origin: '*', type: MessageType.REQUEST_PING };

  return new Promise((resolve, reject) => {
    try {
      let rounds = 0;
      const MAX_ROUNDS = 5;

      // check every 3 second if extension is installed
      const interval = setInterval(() => {
        if (rounds >= MAX_ROUNDS) {
          clearInterval(interval);
          _log('Timeout...', { error: true });
          resolve(false);
        }

        // check again
        window.postMessage(request, '*');
        _log('Pinging...');

        // increment rounds
        rounds++;

      }, 1000);

      // listen for response from extension
      window.addEventListener('message', (event) => {
        const message: BaseMessage = {
          type: event.data.type,
          description: event.data.description
        };

        if (message.type === MessageType.RESPONSE_PING) {
          _log('Extension installed');

          clearInterval(interval);
          return resolve(true);
        }

        if (message.type === MessageType.RESPONSE_ERROR) {
          const errorResponse: ErrorResponse = {
            type: event.data.type,
            error: event.data.error
          };

          clearInterval(interval);
          return reject(errorResponse.error);
        }
      });

    } catch (error) {
      const message = (error as Error).message || 'Failed to ping extension';
      _log(message, { error: true });
      resolve(false);
    }
  });
}

/**
 * Returns the public key of the user from the Ssasy extension.
 */
async function requestPublicKey(mode: RequestMode): Promise<string | null> {
  return new Promise((resolve, reject) => {

    // throw error if requestMode is not a string
    if (typeof mode !== 'string') {
      reject(new Error('requestMode must be a string'));
    }

    try {
      // listen for response from extension
      window.addEventListener('message', (event) => {
        const message: BaseMessage = {
          type: event.data.type
        };

        if (message.type === MessageType.RESPONSE_PUBLIC_KEY) {
          _log('Recieved public key from extension');

          const response: PublicKeyResponse = event.data;

          const keyResponse: PublicKeyResponse = {
            type: response.type,
            key: response.key
          };

          return keyResponse.key
            ? resolve(keyResponse.key)
            : resolve(null);
        }

        if (message.type === MessageType.RESPONSE_ERROR) {
        
          const response: ErrorResponse = event.data;
          reject(response.error);
        }
      });

      // send message to extension
      const request: PublicKeyRequest = { origin: '*', mode: mode, type: MessageType.REQUEST_PUBLIC_KEY };
      window.postMessage(request, '*');

    } catch (error) {
      const message = (error as Error).message || 'Failed to request public key';
      _log(message, { error: true });
      resolve(null);
    }
  });
}

/**
 * Returns the challenge response from the Ssasy extension.
 */
async function requestChallengeResponse(mode: RequestMode, encryptedChallengeUri: string): Promise<string | null> {
  return new Promise((resolve, reject) => {

    // throw error if requestMode is not a string
    if (typeof mode !== 'string') {
      reject(new Error('requestMode must be a string'));
    }

    // throw error if challengeString is not a string
    if (typeof encryptedChallengeUri !== 'string') {
      reject(new Error('challengeString must be a string'));
    }

    // listen for response from extension
    window.addEventListener('message', (event) => {
      
      const message: BaseMessage = { type: event.data.type };

      if (message.type === MessageType.RESPONSE_CHALLENGE_RESPONSE) {
        _log('Recieved challenge response from extension');

        const response: ChallengeResponse = event.data;

        if (response.challengeResponse) {
          resolve(response.challengeResponse);

        } else {
          resolve(null);
        }
      }

      if (message.type === MessageType.RESPONSE_ERROR) {
        
        const response: ErrorResponse = event.data;
        reject(response.error);
      }
    });

    // send message to extension
    const request: ChallengeRequest = {
      origin: '',
      mode: mode,
      type: MessageType.REQUEST_CHALLENGE_RESPONSE,
      challenge: encryptedChallengeUri
    };

    window.postMessage(request, '*');
  });
}

export const Bridge = {
  isExtensionInstalled,
  requestPublicKey,
  requestChallengeResponse
};