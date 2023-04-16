import fs from 'fs-extra'
import { getManifest } from '../src/manifest'
import { log, r, isManifest3 } from './utils'

/**
 * Writes manifest.ts to extension folder as manifest.json
 */
export async function writeManifest() {
  await fs.writeJSON(r('extension/manifest.json'), await getManifest(isManifest3 ? 'v3' : 'v2'), { spaces: 2 })
  log('PRE', 'write manifest.json')
}

writeManifest()
