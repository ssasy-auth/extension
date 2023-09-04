import { beforeEach, describe, expect, it } from 'vitest'
import { Bridge } from '~/bridge/src/bridge'
import { MessageType } from '~/bridge/src/types'
import type { PublicKeyResponse, ChallengeResponse } from '~/bridge/src/types'

describe('Bridge', () => {
  describe('isExtensionInstalled', () => {
    it('should return true if extension is installed');
    it('should return false if extension is not installed');
  })

  describe('requestPublicKey', () => {
    /**
     * Dispatches an event message with a challenge response. Used to simulate 
     * the message event from the extension.
     */
    function _dispatchSuccessResponse() {
      const response: PublicKeyResponse = { type: MessageType.RESPONSE_PUBLIC_KEY, key: 'key' };

      window.dispatchEvent(new MessageEvent(
        'message',
        { data: response }
      ));
    }

    // mock window.addEventListener response for each test in `requestChallengeResponse`
    beforeEach(() => {
      setTimeout(() => {
        _dispatchSuccessResponse();
      }, 500);
    })

    it('should throw error if requestMode is not a string', async () => {
      let errorThrown = false;

      try {
        await Bridge.requestPublicKey(1 as any);
      } catch (error) {
        errorThrown = true;
      }

      expect(errorThrown).to.be.true;
    })
  })

  describe('requestChallengeResponse', () => {

    /**
     * Dispatches an event message with a challenge response. Used to simulate 
     * the message event from the extension.
     */
    function _dispatchSuccessResponse() {
      const response: ChallengeResponse = { type: MessageType.RESPONSE_CHALLENGE_RESPONSE, challengeResponse: 'challenge response' };

      window.dispatchEvent(new MessageEvent(
        'message',
        { data: response }
      ));
    }

    // mock window.addEventListener response for each test in `requestChallengeResponse`
    beforeEach(() => {
      setTimeout(() => {
        _dispatchSuccessResponse();
      }, 500);
    })

    it('should throw error if requestMode is not a string', async () => {
      let errorThrown = false;

      try {
        await Bridge.requestChallengeResponse(1 as any, 'challengeString');
      } catch (error) {
        errorThrown = true;
      }

      expect(errorThrown).to.be.true;
    })

    it('should throw error if challengeString is a string', async () => {
      let errorThrown = false;

      try {
        await Bridge.requestChallengeResponse('login', 1 as any);
      }
      catch (error) {
        errorThrown = true;
      }

      expect(errorThrown).to.be.true;
    })
  })
})
