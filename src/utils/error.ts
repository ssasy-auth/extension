import { CRYPTO_ERROR_MESSAGE, WALLET_ERROR_MESSAGE } from '@ssasy-auth/core';

/**
 * Returns a new error with a more user friendly message, if possible. 
 * 
 * This function only supports errors thrown by the `@ssasy-auth/core` library. Other errors are returned as is.
 * 
 * @param error - Error to handle
 * @returns error
 */
export function processSsasyLikeError(error: unknown): Error {
  // return if it is not an instance of Error
  if(!(error instanceof Error)) {
    return error as Error;
  }

  const phishingWarning = 'Warning! This site may be attempting a phishing attack.';
  const authenticityAction = 'Ensure you\'re on the genuine website before proceeding.';
  const ssasyAdjustment = 'Adjust your \'Ssasy\' settings (do not require signature) if you\'re confident about the site\'s authenticity.';

  if(error.message === CRYPTO_ERROR_MESSAGE.WRONG_KEY) {
    throw new Error('Wrong passphrase for vault key');
  }

  if(error.message === WALLET_ERROR_MESSAGE.INVALID_CIPHERTEXT_SIGNATURE) {
    throw new Error(`${phishingWarning} This is because it didn't provide a recognized signature. ${authenticityAction} Or, ${ssasyAdjustment}`);
  }

  if(error.message === WALLET_ERROR_MESSAGE.INVALID_SIGNATURE_ORIGIN) {
    throw new Error(`${phishingWarning} This is because the site's public key doesn't match the key in the signature. ${authenticityAction} Or, ${ssasyAdjustment}`);
  }

  return error;
}