enum MessageType {
  REQUEST_PUBLIC_KEY = 'request-public-key',
  REQUEST_SOLUTION = 'request-solution',
  REQUEST_PING = 'request-ping',
  RESPONSE_PUBLIC_KEY = 'response-public-key',
  RESPONSE_SOLUTION = 'response-solution',
  RESPONSE_PING = 'response-ping',
  RESPONSE_ERROR = 'response-error',
}

type RequestMode = 'registration' | 'login';

interface BaseMessage {
  type: MessageType;
  description?: string;
}

interface BaseRequest extends BaseMessage {
  origin: string;
}

interface PublicKeyRequest extends BaseRequest {
  type: MessageType.REQUEST_PUBLIC_KEY;
  mode: RequestMode;
}

interface PublicKeyResponse extends BaseMessage {
  type: MessageType.RESPONSE_PUBLIC_KEY;
  key: string | null;
}

interface ChallengeRequest extends BaseRequest {
  type: MessageType.REQUEST_SOLUTION;
  mode: RequestMode;
  challenge: string;
}

interface ChallengeResponse extends BaseMessage {
  type: MessageType.RESPONSE_SOLUTION;
  solution: string | null;
}

interface ErrorResponse extends BaseMessage {
  type: MessageType.RESPONSE_ERROR;
  error: string;
}

export {
  MessageType,
  RequestMode,
  BaseMessage,
  BaseRequest,
  PublicKeyRequest,
  PublicKeyResponse,
  ChallengeRequest,
  ChallengeResponse,
  ErrorResponse
};