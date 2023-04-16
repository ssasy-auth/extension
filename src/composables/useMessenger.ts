import { MessageType } from '~/bridge';
import type { PublicKeyResponse, ChallengeResponse } from '~/bridge';

/**
 * Responds to a public key request with the user's public key and closes the popup window.
 *
 * @param origin - the origin of the website that started the message
 * @param key - the public key of the user
 */
function broadcastPublicKeyResponse(key: string | null, error?: string) {
  // define message
  const message: PublicKeyResponse = {
    type: MessageType.RESPONSE_PUBLIC_KEY,
    key: key,
    description: error
  };

  // send message to [background script]
  browser.runtime.sendMessage(message);
}

/**
 * Responds to a challenge request with the solution to the challenge and closes the popup window.
 * 
 * @param solution - the solution to the challenge
 * @param error - an error message
 */
function broadcastChallengeResponse(solution: string | null, error?: string) {
  // define message
  const message: ChallengeResponse = {
    type: MessageType.RESPONSE_SOLUTION,
    solution,
    description: error
  };

  // send message to [background script]
  browser.runtime.sendMessage(message);
}

export const useMessenger = () => {
  return {
    broadcastPublicKeyResponse,
    broadcastChallengeResponse
  };
};
