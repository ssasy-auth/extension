export const SSASY_MESSAGE = {
  REQUEST_PUBLIC_KEY: 'request-public-key',
  REQUEST_SOLUTION: 'request-solution',
  RESPONSE_PUBLIC_KEY: 'response-public-key',
  RESPONSE_SOLUTION: 'response-solution'
};

export type MessageType = typeof SSASY_MESSAGE[keyof typeof SSASY_MESSAGE];

export interface MessageData {
	type: MessageType;
	key?: string | null;
}

/**
 * Message interface for communication within the extension and between
 * the extension and websites
 */
export interface SsasyMessage {
	/**
	 * the origin of the message. This should be the orgin of the website
	 * that started the message.
	 */
	origin: string;
  /**
   * the data of the message
   */
	data: MessageData;
}

/**
 * Responds to a public key request with the user's public key and closes the popup window.
 *
 * @param origin - the origin of the website that started the message
 * @param key - the public key of the user
 */
function broadcastPublicKeyResponse(origin: string, key: string | null) {
  // define message
  const message: SsasyMessage = {
    origin,
    data: {
      type: SSASY_MESSAGE.RESPONSE_PUBLIC_KEY,
      key
    }
  };

  // send message to [background script]
  browser.runtime.sendMessage(message).then();
}


export const SsasyMessenger = {
  broadcastPublicKeyResponse
};
