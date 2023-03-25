import { CRYPTO_ERROR_MESSAGE, WALLET_ERROR_MESSAGE } from '@this-oliver/ssasy';

/**
 * Returns a new error with a more user friendly message, if possible. 
 * 
 * This function only supports errors thrown by the `@this-oliver/ssasy` library. Other errors are returned as is.
 * 
 * @param error - Error to handle
 * @returns error
 */
export function processSsasyLikeError(error: unknown): Error {
  // return if it is not an instance of Error
  if(!(error instanceof Error)) {
    return error as Error;
  }

  if(error.message === CRYPTO_ERROR_MESSAGE.WRONG_KEY) {
    return new Error('Wrong passphrase for vault key');
  }

  if(error.message === WALLET_ERROR_MESSAGE.INVALID_CIPHERTEXT_SIGNATURE) {
    return new Error('(Security Warning - Phishing Alert) The service you are logging into did not provide a valid signature which is a sign of a phishing attack. If this is a mistake, please register to the service and try again or configure your Ssasy settings to not require signatures.');
  }

  if(error.message === WALLET_ERROR_MESSAGE.INVALID_SIGNATURE_ORIGIN) {
    return new Error('(Security Warning - Phishing Alert) You might be logging into a service that you have not registered to. If this is a mistake, please register to the service and try again.');
  }

  return error;
}