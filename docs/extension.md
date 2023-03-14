# Application Tech Stack: Building a browser extension

> This follows the Mozilla [Getting Started](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension) guide.

## Manifest file

The `manifest.json` file is the heart of the extension. It contains the metadata and configuration for the browser extension.

```json
{
 "manifest_version": 2, // The version of the manifest format (not the extension).
 "name": "SSASy", // The name of the extension
 "version": "0.0.1", // The version of the extension
 "description": "A self-sovereign authentication scheme", // short description (Optional)
 "homepage_url": "localhost:3000", // The URL for the extension homepage (Optional)
 "icons": {
  // The icons for the extension (Optional)
  "16": "icons/icon-16x16.png", // 16x16 icon for the toolbar
  "48": "icons/icon-48x48.png" // 48x48 icon for the toolbar
 },
 "browser_action": {
  // The browser action is the main button for the extension (Optional)
  "default_icon": "icons/icon-48x48.png", // The icon for the browser action
  "default_title": "SSASy", // The title for the browser action
  "default_popup": "dist/index.html" // The popup for the browser action
 },
 "permissions": [
  // The permissions for the extension (Optional)
  "https://localhost:3000/*", // host permission that allows for special privileges for urls that match the pattern (see [host permissions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/permissions#host_permissions))
  "storage", // The storage permission allows the extension to store data
  "unlimitedStorage", // The unlimitedStorage permission allows the extension to store unlimited data
  "activeTab", // The activeTab permission allows the extension to access the active tab
  "clipboardWrite" // The clipboardWrite permission allows the extension to write to the clipboard
 ],
 "background": {
  // The background script is a persistent script that runs in the background (Optional)
  "page": "index.html", // The background page (Required if scripts is not specified)
  "scripts": ["background.js"], // The background script (Required if page is not specified)
  "persistent": true // The background script is persistent until the extension is disabled or uninstalled or the browser is closed
 },
 "commands": {
  // The commands for the extension (Optional)
  "_execute_browser_action": {
   // The command to execute the browser action
   "suggested_key": {
    // The suggested key for the command
    "default": "Alt+Shift+Y", // The default key for the command
    "mac": "Alt+Shift+Y", // The mac key for the command
    "linux": "Alt+Shift+Y", // The linux key for the command
    "windows": "Alt+Shift+Y" // The windows key for the command
   },
   "description": "Open SSASy" // The description for the command
  }
 }
}
```

### Icons

To generate icons, I used the [Favicon](https://favicon.io/) and [PWA APP ICON GENERATOR](https://tools.crawlink.com/tools/pwa-icon-generator/).

## Extension structure

The extension can be grouped into [six main parts](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Anatomy_of_a_WebExtension) but for the sake of simplicity, I will only discuss three of them:

1. The `background` script responds to events in the browser while the extension is running. Background scripts can be persisten, which means they continue to run when the extension's popup is closed. Background scripts can also be event pages, which are unloaded when not in use.
2. The visual elements of the extension like the `popup` and `option` pages. Where the `popup` is the dialog that appears when you click on the `browser action` (e.g. the extension's icon in the toolbar) and the `option` page which is the page that appears when you want to interact with the extension's settings.
3. The `content` script which is a JavaScript file that runs in the context of web pages. Content scripts can read details of the web pages the browser visits, make changes to them, and pass messages to their parent extension.

### Background script

## Getting started

During the development phase, you can use the [about:debugging](about:debugging#/runtime/this-firefox) page to load the extension and test it. This takes a couple of steps:

1. build the project `npm run build` which creates the `dist` folder
2. copy the `manifest.json` file to the `dist` folder
3. open the [`about:debugging`](about:debugging#/runtime/this-firefox) page
4. load the `dist/manifest.json` file
5. play around with the extension

Below are some optional reads:

- this [article](https://extensionworkshop.com/documentation/develop/debugging/#debugging-popups) explains how to debug the extension which is useful when you want to debug the popup.

## Building from the `antfu/vitesse-webext` template

The template is a fork of the [antfu/vitesse](https://github.com/antfu/vitesse-webext). It is a template for building browser extensions with [Vue 3](https://v3.vuejs.org/), [TypeScript](https://www.typescriptlang.org/) and [Vite](https://vitejs.dev/) - this project's tech stack.
