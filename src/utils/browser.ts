import type { Windows, Tabs } from 'webextension-polyfill';

/**
 * Defines the type of page to open. The types are also the root "path"
 * of the popup and options pages (e.g. popup/index.html, options/index.html).
 */
type PageType = 'popup' | 'options';

/**
 * Defines the page route configuration.
 */
interface PageRoute {
	type: PageType;
	route?: string;
	query?: string;
}

/**
 * Defines the configuration for opening a page.
 */
interface OpenConfig {
	route?: string;
	queryString?: string;
}

/**
 * Defines the configuration for closing a page.
 */
interface CloseConfig {
  id?: number;
}

/**
 * Defines the page controller interface. The controller is responsible for
 * opening and closing pages programmatically.
 */
interface PageController {
	/**
	 * opens the page
   * 
   * @param config - page config (optional)
	 */
	open(config?: OpenConfig): Promise<Windows.Window | Tabs.Tab>;
	/**
	 * closes the page
	 */
	close(config?: CloseConfig): void;
}

/**
 * Returns the path to the a page based on the config.
 */
function getPath(config?: PageRoute): string {
  const { type, route, query } = config || {};

  let pageUrl = browser.runtime.getURL(`dist/${type}/index.html`);

  if (route) {
    pageUrl += `#${route}`;
  }

  if (query) {
    pageUrl += `?${query}`;
  }

  return pageUrl;
}

/**
 * A page controller for opening and closing the popup page.
 */
export const PopupPage: PageController = {
  async open(config?): Promise<Windows.Window> {
    const { route, queryString } = config || {};

    const extensionURL = getPath({
      type: 'popup',
      route,
      query: queryString
    });

    const popupWidth = 400;
    const popupHeight = 600;
    const window = await browser.windows.getCurrent();
    const screenWidth = window.width || popupWidth * 2;

    const windowOptions: Windows.CreateCreateDataType = {
      url: extensionURL,
      type: 'popup',
      top: 0,
      left: screenWidth - popupWidth,
      width: popupWidth,
      height: popupHeight
    };

    return await browser.windows
      .create(windowOptions)
      .then(function (popupWindow) {
        if (popupWindow === undefined) {
          throw new Error('popup window is undefined');
        }

        return popupWindow;
      });
  },
  
  close(config?) {
    if(config?.id) {
      browser.windows.getAll().then((windows) => {
        for (const window of windows) {
          if (window.type === 'popup' && window.id === config.id) {
            browser.windows.remove(window.id as number);
          }
        }
      });
    } 
    
    else {
      const views = browser.extension.getViews({ type: 'popup' });
      for (const view of views) {
        view.close();
      }
  
      browser.windows.getAll().then((windows) => {
        for (const window of windows) {
          if (window.type === 'popup') {
            browser.windows.remove(window.id as number);
          }
        }
      });
    }
  }
};

/**
 * A page controller for opening and closing the options page.
 */
export const OptionPage: PageController = {
  async open(config?): Promise<Tabs.Tab> {
    const { route, queryString } = config || {};

    const extensionURL = getPath({
      type: 'options',
      route,
      query: queryString
    });

    return await browser.tabs.create({
      url: extensionURL
    });
  },
  
  close() {
    const views = browser.extension.getViews({ type: 'tab' });
    for (const view of views) {
      // if view is an options page
      if (view.location.href.includes('options')) {
        view.close();
      }
    }
  }
};
