import fs from 'fs-extra'
import { resolve } from 'node:path'
import { r } from './utils'
import type RootPkgType from '../package.json'

// path to root of bridge directory
const bridgeR = (...args: string[]) => resolve(__dirname, '../src/bridge', ...args)

export async function updatePackageMetaData(){
  // get root package.json
  const rootPackage = await fs.readJSON(r('package.json')) as typeof RootPkgType;
  
  const { 
    name,
    version,
    dependencies,
    author,
    license,
    repository
  } = rootPackage;

  const ssasyDependency = dependencies['@ssasy-auth/core'];
  
  // package.json in bridge
  const bridgePackage = {} as any;
  bridgePackage.name = name;
  bridgePackage.version = version;
  bridgePackage.author = author;
  bridgePackage.license = license;
  bridgePackage.repository = repository;
  bridgePackage.description = 'a bridge that enables communication between websites and the ssasy extension';
  bridgePackage.main = 'lib/index.js';

  bridgePackage.dependencies = {} as any;
  bridgePackage.dependencies['@ssasy-auth/core'] = ssasyDependency;

  await fs.writeJSON(bridgeR('package.json'), bridgePackage, { spaces: 2 })
}

updatePackageMetaData();