// generate stub index.html files for dev entry
import { execSync } from 'node:child_process'
import fs from 'fs-extra'
import chokidar from 'chokidar'
import { isDev, log, port, r, isManifest3 } from './utils'

/**
 * Stub index.html to use Vite in development
 */
async function stubIndexHtml() {
  const views = [
    'options',
    'popup'
  ]

  // manifest v3 does not support background pages
  if (!isManifest3) {
    views.push('background')
  }

  for (const view of views) {
    await fs.ensureDir(r(`extension/dist/${view}`))
    let data = await fs.readFile(r(`src/${view}/index.html`), 'utf-8')
    data = data
      .replace('"./main.ts"', `"http://localhost:${port}/${view}/main.ts"`)
      .replace('<div id="app"></div>', '<div id="app">Vite server did not start</div>')
    await fs.writeFile(r(`extension/dist/${view}/index.html`), data, 'utf-8')
    log('PRE', `stub ${view}`)
  }
}

/**
 * Write manifest.json to extension folder
 */
function writeManifest() {
  execSync('npx esno ./scripts/manifest.ts', { stdio: 'inherit' })
}

writeManifest()

if (isDev && !isManifest3) {
  stubIndexHtml()

  // watch for changes to html files
  chokidar.watch(r('src/**/*.html'))
    .on('change', () => {
      stubIndexHtml()
    })

  // watch for changes to manifest.ts or package.json
  chokidar.watch([ r('src/manifest.ts'), r('package.json') ])
    .on('change', () => {
      writeManifest()
    })
}
