import { onMessage } from 'webext-bridge';
import { Windows, Tabs } from 'webextension-polyfill';
import { PopupPage, Logger } from '~/common/utils';
import { MessageType } from '~/common/logic';
import type {
  GenericMessage,
  KeyRequest,
  KeyResponse,
  ChallengeRequest,
  ChallengeResponse
} from '~/common/logic';

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client');
  // load latest content script
  import('./contentScriptHMR');
}

let currentTabId = 0;

/**
 * Listen for extension install and log to console
 */
browser.runtime.onInstalled.addListener((): void => {
  Logger.info('Extension installed', null, 'background');
});

/**
 * Listen for tab changes and update currentTabId
 */
browser.tabs.onActivated.addListener(async ({ tabId }) => {
  if (!currentTabId) {
    currentTabId = tabId;
    return;
  }

  currentTabId = tabId;
});

export interface Session {
	request: KeyRequest | ChallengeRequest;
	popupPage: Windows.Window | Tabs.Tab;
}

let sessionTab: number = 0;

/**
 * Listen for public key requests from content scripts and 
 * responds with a public key response after user makes a decision (approve/deny)
 */
onMessage(MessageType.RequestPublicKey, async ({ data }) => {
  const request: KeyRequest = {
    origin: data.origin,
    type: MessageType.RequestPublicKey
  };

  // open popup window for user approval
  const route = '/service/register';
  const query = `route=${route}&origin=${request.origin}`;

  const session: Session = {
    request,
    popupPage: await PopupPage.open({ queryString: query })
  }

  sessionTab = session.popupPage.id || 0;
  Logger.info('sessionTab set to ', sessionTab, 'background');

  // wait for response from popup window
  return new Promise((resolve) => {
    // broadcast undefined response, if the messageSession is still active and popup window is closed
    browser.windows.onRemoved.addListener(async (windowId) => {
      if (session?.popupPage.id === windowId) {
        const response: KeyResponse = {
          type: MessageType.ResponsePublicKey,
          key: null
        };

        resolve(response);
      }
    });

    // listen for public key response broadcast from [popup] and forward to [content script]
    browser.runtime.onMessage.addListener(async (msg) => {
      
      // define message
      const message: GenericMessage = {
        type: msg.type
      };

      if(message.type === MessageType.ResponsePublicKey) {
        const response: KeyResponse = {
          type: MessageType.ResponsePublicKey,
          key: msg.key
        };
  
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
onMessage(MessageType.RequestSolution, async ({ data }) => {
  const request: ChallengeRequest = {
    origin: data.origin,
    type: MessageType.RequestSolution,
    challenge: data.challenge
  };

  // send message to [popup]
  await browser.runtime.sendMessage(request);

  // wait for response from popup window
  return new Promise((resolve) => {
    // broadcast undefined response, if the messageSession is still active and popup window is closed
    browser.windows.onRemoved.addListener(async (windowId) => {
      if (sessionTab === windowId) {
        const response: ChallengeResponse = {
          type: MessageType.ResponseSolution,
          solution: null
        };

        resolve(response);
      }
    });

    // listen for challenge response broadcast from [popup] and forward to [content script]
    browser.runtime.onMessage.addListener(async (msg) => {
      const message: GenericMessage = {
        type: msg.type
      };

      if(message.type === MessageType.ResponseSolution) {
        const response: ChallengeResponse = {
          type: MessageType.ResponseSolution,
          solution: msg.solution
        };

        // respond to content script
        return resolve(response);
      }
    });
  });
});
