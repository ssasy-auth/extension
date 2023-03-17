import { onMessage } from 'webext-bridge';
import { Windows, Tabs } from 'webextension-polyfill';
import {
  LocalStorage,
  PopupPage,
  SSASY_MESSAGE,
  SsasyMessenger
} from '~/logic';
import type { SsasyMessage } from '~/logic';

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
  // eslint-disable-next-line no-console
  console.log('Extension installed');
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

export interface ActiveSession {
	message: SsasyMessage;
	popupPage: Windows.Window | Tabs.Tab;
}

/**
 * 1. listens for public key requests from content scripts
 * 2. opens popup window and waits for user approval (approve/deny)
 * 3. replies to content script with public key response after user makes a decision
 */
onMessage(SSASY_MESSAGE.REQUEST_PUBLIC_KEY, async ({ data }) => {
  console.info('[ext-background] received content script message', data);
  const requestMessage = data as unknown as SsasyMessage;

  // open popup window for user approval
  const route = '/service/register';
  const query = `route=${route}&origin=${requestMessage.origin}`;
  const popupWindo = await PopupPage.open({
    queryString: query
  });

  // set messageSession
  setMessageSession({
    message: requestMessage,
    popupPage: popupWindo
  });

  // broadcast undefined response, if the messageSession is still active and popup window is closed
  browser.windows.onRemoved.addListener(async (windowId) => {
    if (getMessageSession()?.popupPage.id === windowId) {
      // broadcast undefined response
      SsasyMessenger.broadcastPublicKeyResponse(requestMessage.origin, null);
    }
  });

  // wait for response from popup window
  return new Promise((resolve) => {
    // listen for public key response broadcast from [popup] and forward to [content script]
    browser.runtime.onMessage.addListener(async (msg) => {
      
      // define message
      console.info('[ext-background] received popup message', msg);
      const responseMessage = msg as unknown as SsasyMessage;

      // reset session
      resetMessageSession();

      // respond to content script
      return resolve(responseMessage);
    });
  });
});

// TODO: listen for solution request broadcast from [content script]
// TODO: listen for solution response broadcast from [popup]

function resetMessageSession() {
  if (getMessageSession() === undefined) {
    console.info('[ext-background] no active message session to reset');
    return;
  }

  // close popup window
  PopupPage.close();

  // set session to undefined
  setMessageSession(undefined);

  console.info('[ext-background] deactivating message session');
}

function getMessageSession(): ActiveSession | undefined {
  try {
    return JSON.parse(LocalStorage.MessageSession.get() as string);
  } catch (error) {
    return undefined;
  }
}

function setMessageSession(session: ActiveSession | undefined) {
  if (session === undefined) {
    LocalStorage.MessageSession.set(undefined);
  } else {
    LocalStorage.MessageSession.set(JSON.stringify(session));
  }
}
