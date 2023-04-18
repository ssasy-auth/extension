import fs from 'fs-extra'
import type { Manifest } from 'webextension-polyfill'
import type PkgType from '../package.json'
import { isDev, port, r, isManifest3 } from '../scripts/utils'

const extIcons = {
  16: './assets/icon-16.png',
  32: './assets/icon-32.png',
  96: './assets/icon-96.png',
  128: './assets/icon-128.png',
  196: './assets/icon-196.png'
}

const extPermissions = [
  'storage', // used to store credentials and system settings
  'unlimitedStorage' // used to store credentials and system settings
]

const extHostPermissions = [
  'https://*/*', // used to communicate with web services on https
  'http://*/*' // used to communicate with web services on http
]

const manifestV2: Manifest.WebExtensionManifest = {
  manifest_version: 2,
  name: 'template-title',
  version: '0.0.0',
  description: 'template-description',

  browser_action: {
    default_icon: { ...extIcons },
    default_popup: './dist/popup/index.html'
  },
  permissions: [ ...extPermissions, ...extHostPermissions ],
  options_ui: {
    page: './dist/options/index.html',
    open_in_tab: true
  },
  background: {
    page: './dist/background/index.html',
    persistent: true
  },
  icons: { ...extIcons },
  content_scripts: [ 
    {
      matches: [ 'http://*/*', 'https://*/*' ],
      js: [ './dist/contentScripts/index.global.js' ]
    } 
  ],
  commands: {
    // The command to execute the browser action
    _execute_browser_action: {
      // The suggested key for the command
      suggested_key: {
        default: 'Alt+Shift+Y', // The default key for the command
        mac: 'Alt+Shift+Y', // The mac key for the command
        linux: 'Alt+Shift+Y', // The linux key for the command
        windows: 'Alt+Shift+Y' // The windows key for the command
      },
      description: 'open ssasy' // The description for the command
    }
  }
}

const manifestV3: Manifest.WebExtensionManifest = {
  ...manifestV2,
  
  manifest_version: 3,

  action: {
    default_icon: { ...extIcons },
    default_popup: './dist/popup/index.html'
  },
  
  permissions: extPermissions,
  
  host_permissions: extHostPermissions,

  background: {
    service_worker: './dist/background/index.js',
    type: 'module'
  },

  // remove deprecated fields
  browser_action: undefined
}

type ManifestVersion = 'v2' | 'v3'

/**
 * Returns a json object of the manifest config based on the manifest version
 * 
 * @param version - manifest version
 * @returns manifest.json
 */
export async function getManifest(version: ManifestVersion = 'v2'): Promise<Manifest.WebExtensionManifest> {
  const pkg = await fs.readJSON(r('package.json')) as typeof PkgType

  // set base manifest based on manifest version
  const baseManifest: Manifest.WebExtensionManifest = version === 'v3' 
    ? manifestV3 
    : manifestV2

  // update this file to update this manifest.json
  // can also be conditional based on your need
  const manifest: Manifest.WebExtensionManifest = {
    ...baseManifest,
    
    name: pkg.nickname || pkg.name,
    version: pkg.version,
    description: pkg.description
  }

  if (isDev) {
    // for content script, as browsers will cache them for each reload,
    // we use a background script to always inject the latest version
    // see src/background/contentScriptHMR.ts
    delete manifest.content_scripts
    manifest.permissions?.push('webNavigation')

    // this is required on dev for Vite script to load
    const policy = `script-src 'self' http://localhost:${port}; object-src 'self'`;
    manifest.content_security_policy = isManifest3
      ? { 'extension_pages': policy }
      : policy
  }

  return manifest
}
