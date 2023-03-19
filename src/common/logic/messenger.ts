export enum MessageType {
  RequestPublicKey = 'request-public-key',
  RequestSolution = 'request-solution',
  RequestPing = 'request-ping',
  ResponsePublicKey = 'response-public-key',
  ResponseSolution = 'response-solution',
  ResponsePing = 'response-ping',
  ResponseError = 'response-error'
}

/**
 * the foundation of all messages (both requests and responses)
 */
interface BaseMessage {
  /**
   * the description of the message
   */
  description?: string;
}

export interface GenericMessage extends BaseMessage {
  /**
   * the type of the message (can be any of the MessageType enum values)
   */
  type: typeof MessageType[keyof typeof MessageType];
}

export interface GenericRequest extends GenericMessage {
  /**
	 * the origin of the message. This should be the orgin of the website
	 * that started the message.
	 */
  origin: string;
}

/**
 * request messages for the user's public key
 */
export interface KeyRequest extends GenericRequest {
  type: MessageType.RequestPublicKey;
}

/**
 * response messages for the user's public key request
 */
export interface KeyResponse extends BaseMessage {
  type: MessageType.ResponsePublicKey;
  key: string | null;
}

/**
 * request messages for the user's solution to a challenge/response
 */
export interface ChallengeRequest extends GenericRequest {
  type: MessageType.RequestSolution;
  challenge: string;
}

/**
 * response messages to a challenge/response
 */
export interface ChallengeResponse extends BaseMessage {
  type: MessageType.ResponseSolution;
  solution: string | null;
}

/**
 * Responds to a public key request with the user's public key and closes the popup window.
 *
 * @param origin - the origin of the website that started the message
 * @param key - the public key of the user
 */
function broadcastPublicKeyResponse(key: string | null, error?: string) {
  // define message
  const message: KeyResponse = {
    type: MessageType.ResponsePublicKey,
    key,
    description: error
  };

  // send message to [background script]
  browser.runtime.sendMessage(message);
}

function broadcastChallengeResponse(solution: string | null, error?: string) {
  // define message
  const message: ChallengeResponse = {
    type: MessageType.ResponseSolution,
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
