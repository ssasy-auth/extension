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
 * Listen for extension install and log to console
 */
browser.runtime.onInstalled.addListener((): void => {
  Logger.info('Extension installed', null, 'background');
});

export interface Session {
  request: PublicKeyRequest | ChallengeRequest;
  popupPage: Windows.Window | Tabs.Tab;
}

let currentRequestTab: number = -1;

/**
 * Listen for current tab requests from content scripts
 */
onMessage('close-request-tab', ({ data }) => {
  Logger.info('close-request-tab channel', 'close popup message recieved', 'background');

  if (data) {
    // show error message to user
    const error: ErrorResponse = data;
    Logger.error(error.error, null, 'background');
  }

  // close popup window
  if (currentRequestTab !== -1) {
    PopupPage.close({ id: currentRequestTab });
  }
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

  currentRequestTab = session.popupPage.id || 0;
  Logger.info('currentRequestTab set to ', currentRequestTab, 'background');

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

        // reset current request tab
        currentRequestTab = -1;

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
onMessage(MessageType.REQUEST_SOLUTION, async ({ data }) => {
  const request: ChallengeRequest = {
    origin: data.origin,
    type: MessageType.REQUEST_SOLUTION,
    mode: data.mode,
    challenge: data.challenge
  };

  // send message to [popup]
  await browser.runtime.sendMessage(request);

  // wait for response from popup window
  return new Promise((resolve) => {
    // broadcast undefined response, if the messageSession is still active and popup window is closed
    browser.windows.onRemoved.addListener(async (windowId) => {
      if (currentRequestTab === windowId) {
        const response: ChallengeResponse = {
          type: MessageType.RESPONSE_SOLUTION,
          solution: null
        };

        // reset current request tab
        currentRequestTab = -1;

        return resolve(response);
      }
    });

    // listen for challenge response broadcast from [popup] and forward to [content script]
    browser.runtime.onMessage.addListener(async (msg) => {
      const message: BaseMessage = {
        type: msg.type
      };

      if (message.type === MessageType.RESPONSE_SOLUTION) {
        const response: ChallengeResponse = {
          type: MessageType.RESPONSE_SOLUTION,
          solution: msg.solution
        };

        // respond to content script
        return resolve(response);
      }
    });
  });
});
