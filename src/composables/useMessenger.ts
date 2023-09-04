import { MessageType } from '~/bridge';
import type { PublicKeyResponse, ChallengeResponse } from '~/bridge';

/**
 * Broadcasts public key response to background
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
 * Broadcasts challenge response to background
 * 
 * @param challengeResponse - challenge response
 * @param error - an error message
 */
function broadcastChallengeResponse(challengeResponse: string | null, error?: string) {
  // define message
  const message: ChallengeResponse = {
    type: MessageType.RESPONSE_CHALLENGE_RESPONSE,
    challengeResponse,
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
