export enum ExtensionMessage {
  RequestPublicKey = 'request-public-key',
  RequestSolution = 'request-solution',
  RequestPing = 'request-ping',
  ResponsePublicKey = 'response-public-key',
  ResponseSolution = 'response-solution',
  ResponsePing = 'response-ping'
}

export type MessageType = typeof ExtensionMessage[keyof typeof ExtensionMessage];

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
      type: ExtensionMessage.ResponsePublicKey,
      key
    }
  };

  // send message to [background script]
  browser.runtime.sendMessage(message).then();
}


export const SsasyMessenger = {
  broadcastPublicKeyResponse
};
