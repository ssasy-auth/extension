import type { RawKey } from '@ssasy-auth/core';
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
          console.info('[ssasy-bridge]', 'Timeout...')
          resolve(false);
        }
        
        // check again
        window.postMessage(request, '*');
        console.info('[ssasy-bridge]', 'Pinging...')

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
          console.info('[ssasy-bridge] Extension installed')

          clearInterval(interval);
          return resolve(true);
        }

        if(message.type === MessageType.RESPONSE_ERROR){
          const errorResponse: ErrorResponse = {
            type: event.data.type,
            error: event.data.error
          };

          clearInterval(interval);
          return reject(errorResponse.error);
        }
      });
      
    } catch (error) {
      console.error('[ssasy-bridge]', (error as Error).message || 'Failed to ping extension');
      resolve(false);
    }
  });
}

/**
 * Returns the public key of the user from the Ssasy extension.
 */
async function requestPublicKey(mode: RequestMode): Promise<RawKey | null> {
  return new Promise((resolve, reject) => {
    try {
      // listen for response from extension
      window.addEventListener('message', (event) => {
        const message: BaseMessage = { 
          type: event.data.type
        };
  
        if (message.type === MessageType.RESPONSE_PUBLIC_KEY) {
          console.info('[ssasy-bridge] Recieved public key from extension')

          const keyResponse: PublicKeyResponse = {
            type: event.data.type,
            key: event.data.key
          };

          return keyResponse.key 
            ? resolve(JSON.parse(keyResponse.key) as RawKey)
            : resolve(null);
        }

        if(message.type === MessageType.RESPONSE_ERROR){
          const errorResponse: ErrorResponse = {
            type: event.data.type,
            error: event.data.error
          };

          reject(errorResponse.error);
        }
      });
  
      // send message to extension
      const request: PublicKeyRequest = { origin: '*', mode: mode, type: MessageType.REQUEST_PUBLIC_KEY };
      window.postMessage(request, '*');
      
    } catch (error) {
      console.error('[ssasy-bridge]', (error as Error).message || 'Failed to request public key');
      resolve(null);
    }
  });
}

/**
 * Returns the solution to the challenge from the Ssasy extension.
 */
async function requestSolution(mode: RequestMode, encryptedChallenge: string): Promise<string | null> {

  return new Promise((resolve, reject) => {
    // throw error if requestMode is not a string
    if(typeof mode !== 'string') {
      reject(new Error('requestMode must be a string'));
    }

    // throw error if challengeString is not a string
    if(typeof encryptedChallenge !== 'string') {
      reject(new Error('challengeString must be a string'));
    }
    
    // listen for response from extension
    window.addEventListener('message', (event) => {
      const message: BaseMessage = { type: event.data.type };

      if(message.type === MessageType.RESPONSE_SOLUTION){
        console.info('[ssasy-bridge] Recieved solution from extension');

        const response: ChallengeResponse = {
          type: event.data.type,
          solution: event.data.solution
        };

        if(response.solution){
          resolve(response.solution);

        } else {
          resolve(null);
        }
      }

      if(message.type === MessageType.RESPONSE_ERROR){
        const errorResponse: ErrorResponse = {
          type: event.data.type,
          error: event.data.error
        };

        reject(errorResponse.error);
      }
    });
    
    // send message to extension
    const request: ChallengeRequest = { 
      origin: '', 
      mode: mode,
      type: MessageType.REQUEST_SOLUTION, 
      challenge: encryptedChallenge
    };

    window.postMessage(request, '*');
  }); 
}

export const Bridge = { 
  isExtensionInstalled,
  requestPublicKey,
  requestSolution
};