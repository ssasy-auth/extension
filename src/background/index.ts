import { onMessage } from 'webext-bridge';
import { Windows, Tabs } from 'webextension-polyfill';
import { PopupPage, Logger } from '~/utils';
import { MessageType } from '~/bridge';
import type {
  BaseMessage,
  PublicKeyRequest,
  PublicKeyResponse,
  ChallengeRequest,
  ChallengeResponse,
  ErrorResponse
} from '~/bridge';

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client');
  // load latest content script
  import('./contentScriptHMR');
}

/**
 * Session object
 */
export interface Session {
  request: PublicKeyRequest | ChallengeRequest;
  popupPage: Windows.Window | Tabs.Tab;
}

/**
 * Popup window id. `-1` means no popup window is open, `-2` 
 * means popup window is locked (i.e. user is in the middle of a request)
 */
let popupWindowId: number = -1;

/**
 * Close current request tab and reset `popupWindowId` to `-1`
 */
function _closePopupWindow(): void {
  if (popupWindowId === -1 || popupWindowId === -2) return;

  // close popup window if it is open
  PopupPage.close({ id: popupWindowId });

  // reset current request tab
  popupWindowId = -1;
}

/**
 * Listen for current tab requests from content scripts (client)
 */
onMessage('close-popup', ({ data }) => {
  Logger.info('close-popup channel', 'close popup message recieved', 'background');

  if (data) {
    // show error message to user
    const error: ErrorResponse = data;
    Logger.error(error.error, null, 'background');
  }

  // close current request tab
  _closePopupWindow();
})

/**
 * Listen for public key requests from content scripts and 
 * responds with a public key response after user makes a decision (approve/deny)
 */
onMessage(MessageType.REQUEST_PUBLIC_KEY, async ({ data }) => {
  const request: PublicKeyRequest = {
    origin: data.origin,
    type: MessageType.REQUEST_PUBLIC_KEY,
    mode: data.mode
  };

  // open popup window for user approval
  const route = '/request';
  const query = `route=${route}&mode=${request.mode}&origin=${request.origin}`;

  const session: Session = {
    request,
    popupPage: await PopupPage.open({ queryString: query })
  }

  popupWindowId = session.popupPage.id || 0;
  Logger.info('popupWindowId set to ', popupWindowId, 'background');

  // wait for response from popup window
  return new Promise((resolve) => {
    // broadcast undefined response, if the messageSession is still active and popup window is closed
    browser.windows.onRemoved.addListener(async (windowId) => {
      if (session?.popupPage.id === windowId) {
        const response: PublicKeyResponse = {
          type: MessageType.RESPONSE_PUBLIC_KEY,
          key: null
        };

        resolve(response);
      }
    });

    // listen for public key response broadcast from [popup] and forward to [content script]
    browser.runtime.onMessage.addListener(async (msg) => {

      // define message
      const message: BaseMessage = {
        type: msg.type
      };

      if (message.type === MessageType.RESPONSE_PUBLIC_KEY) {
        const response: PublicKeyResponse = {
          type: MessageType.RESPONSE_PUBLIC_KEY,
          key: msg.key
        };

        // lock popup window to prevent broadcasts from closing the popup window
        popupWindowId = -2;

        // respond to content script
        return resolve(response);
      }
    });
  });
});

/**
 * Listen for challenge requests from content scripts and
 * responds with a challenge response after user makes a decision (approve/deny)
 */
onMessage(MessageType.REQUEST_CHALLENGE_RESPONSE, async ({ data }) => {
  const request: ChallengeRequest = {
    origin: data.origin,
    type: MessageType.REQUEST_CHALLENGE_RESPONSE,
    mode: data.mode,
    challenge: data.challenge
  };

  // send message to [popup]
  await browser.runtime.sendMessage(request);

  // wait for response from popup window
  return new Promise((resolve) => {

    // listen for popup window close event
    browser.windows.onRemoved.addListener(async (windowId) => {

      // close current popup window if it matches the windowId
      if (popupWindowId === windowId) {
        const response: ChallengeResponse = {
          type: MessageType.RESPONSE_CHALLENGE_RESPONSE,
          challengeResponse: null
        };

        // close current request tab
        _closePopupWindow();

        return resolve(response);
      }
    });

    // listen for challenge response broadcast from [popup] and forward to [content script]
    browser.runtime.onMessage.addListener(async (msg) => {
      const message: BaseMessage = {
        type: msg.type
      };

      if (message.type === MessageType.RESPONSE_CHALLENGE_RESPONSE) {
        const response: ChallengeResponse = {
          type: MessageType.RESPONSE_CHALLENGE_RESPONSE,
          challengeResponse: (msg as ChallengeResponse).challengeResponse
        };

        // respond to content script
        return resolve(response);
      }
    });
  });
});
