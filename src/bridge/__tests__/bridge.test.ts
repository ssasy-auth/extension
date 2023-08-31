import { beforeEach, describe, expect, it } from 'vitest'
import { Bridge } from '~/bridge/src/bridge'
import { MessageType } from '~/bridge/src/types'
import type { ChallengeResponse } from '~/bridge/src/types'

describe('Bridge', () => {
  describe('isExtensionInstalled')
  describe('requestPublicKey')
  
  describe.only('requestSolution', () => {

    /**
     * Dispatches an event message with a challenge response. Used to simulate 
     * the message event from the extension.
     */
    function _dispatchSuccessResponse() {
      const challengeResponse: ChallengeResponse = { type: MessageType.RESPONSE_SOLUTION, solution: 'solution' };

      window.dispatchEvent(new MessageEvent(
        'message',
        { data: challengeResponse }
      ));
    }

    // mock window.addEventListener response for each test in `requestSolution`
    beforeEach(() => {
      setTimeout(() => {
        _dispatchSuccessResponse();
      }, 500);
    })

    it('should throw error if requestMode is not a string', async () => {
      let errorThrown = false;

      try {
        await Bridge.requestSolution(1 as any, 'challengeString');
      } catch (error) {
        errorThrown = true;
      }

      expect(errorThrown).toBe(true);
    })
    
    it('should throw error if challengeString is a string', async () => {
      let errorThrown = false;

      try {
        await Bridge.requestSolution('login', 1 as any);
      }
      catch (error) {
        errorThrown = true;
      }

      expect(errorThrown).toBe(true);
    })
  })
})
