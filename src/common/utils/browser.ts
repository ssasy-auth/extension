import type { Windows, Tabs } from 'webextension-polyfill';

type PageType = 'popup' | 'option';

interface PageRoute {
	type: PageType;
	route?: string;
	query?: string;
}

function definePageRoute(config?: PageRoute): string {
  const { type, route, query } = config || {};

  const page = type === 'popup' ? 'popup' : 'options';
  let pageUrl = browser.runtime.getURL(`dist/${page}/index.html`);

  if (route) {
    pageUrl += `#${route}`;
  }

  if (query) {
    pageUrl += `?${query}`;
  }

  return pageUrl;
}

interface PageConfig {
	route?: string;
	queryString?: string;
}

interface PageController {
	/**
	 * opens the page
   * 
   * @param config - page config (optional)
	 */
	open(config?: PageConfig): Promise<Windows.Window | Tabs.Tab>;
	/**
	 * closes the page
	 */
	close(): void;
}

export const PopupPage: PageController = {
  async open(config?): Promise<Windows.Window> {
    const { route, queryString } = config || {};

    const extensionURL = definePageRoute({
      type: 'popup',
      route,
      query: queryString
    });

    const windowOptions: Windows.CreateCreateDataType = {
      url: extensionURL,
      type: 'popup',
      top: 0,
      left: screen.width - 400,
      width: 400,
      height: 600
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
  
  close() {
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
};

export const OptionPage: PageController = {
  async open(config?): Promise<Tabs.Tab> {
    const { route, queryString } = config || {};

    const extensionURL = definePageRoute({
      type: 'option',
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
      // if view is an option page
      if (view.location.href.includes('option')) {
        view.close();
      }
    }
  }
};
