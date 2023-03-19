export enum MessageType {
  REQUEST_PUBLIC_KEY = 'request-public-key',
  REQUEST_SOLUTION = 'request-solution',
  REQUEST_PING = 'request-ping',
  RESPONSE_PUBLIC_KEY = 'response-public-key',
  RESPONSE_SOLUTION = 'response-solution',
  RESPONSE_PING = 'response-ping',
  RESPONSE_ERROR = 'response-error',
}

export enum RequestMode {
  REGISTRATION = 'registration',
  LOGIN = 'login',
}

export interface BaseMessage {
  type: MessageType;
  description?: string;
}

export interface BaseRequest extends BaseMessage {
  origin: string;
}

export interface PublicKeyRequest extends BaseRequest {
  type: MessageType.REQUEST_PUBLIC_KEY;
}

export interface PublicKeyResponse extends BaseMessage {
  type: MessageType.RESPONSE_PUBLIC_KEY;
  key: string | null;
}

export interface ChallengeRequest extends BaseRequest {
  type: MessageType.REQUEST_SOLUTION;
  challenge: string;
}

export interface ChallengeResponse extends BaseMessage {
  type: MessageType.RESPONSE_SOLUTION;
  solution: string | null;
}

export interface ErrorResponse extends BaseMessage {
  type: MessageType.RESPONSE_ERROR;
  error: string;
}

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
    key,
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

export const SsasyMessenger = {
  broadcastPublicKeyResponse,
  broadcastChallengeResponse
};
