/**
 * Closes the popup window
 */
export function closePopup() {
  const views = browser.extension.getViews({ type: 'popup' });
  for (const view of views) {
    view.close();
  }
}

interface openOptionsPageConfig {
  path?: string;
  closePopup?: boolean;
}

/**
 * Opens the options page in a new tab
 * 
 * @param path - The path to open in the options page
 */
export function openOptionsPage (config?: openOptionsPageConfig) {
  if(config?.path){
    browser.tabs.create({ url: '/dist/options/index.html' }).then((tab) => {
      browser.tabs.executeScript(tab.id, {
        code: `window.location.hash = "#${config.path}"`
      });
    }); 
  }else {
    browser.runtime.openOptionsPage()
  }

  if(config?.closePopup === true){
    closePopup();
  }
}
