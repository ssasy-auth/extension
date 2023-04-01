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
  return new Promise((resolve, reject) => {
    try {
      // listen for response from extension
      window.addEventListener('message', (event) => {
        const message: BaseMessage = { 
          type: event.data.type, 
          description: event.data.description
        };

        if (message.type === MessageType.RESPONSE_PING) {
          console.info('[ssasy-bridge] Recieved ping from extension')
          // extension is installed
          resolve(true);
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
      const request: BaseRequest = { origin: '*', type: MessageType.REQUEST_PING };
      window.postMessage(request, '*');

      // timeout after 30 seconds
      setTimeout(() => {
        console.info('ssasy-bridge', 'No response from extension')
        resolve(false);
      }, 30000);
      
    } catch (error) {
      console.error('ssasy-bridge', (error as Error).message || 'Failed to ping extension');
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
      console.error('ssasy-bridge', (error as Error).message || 'Failed to request public key');
      resolve(null);
    }
  });
}

/**
 * Returns the solution to the challenge from the Ssasy extension.
 */
async function requestSolution(mode: RequestMode, encryptedChallenge: string): Promise<string | null> {

  return new Promise((resolve, reject) => {
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