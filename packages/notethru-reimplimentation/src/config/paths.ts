// @remove-on-eject-end
'use strict';

import path from "path"
import fs from "fs"
import url from "node:url"

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath: string) => path.resolve(appDirectory, relativePath);

const buildPath = process.env.BUILD_PATH || 'build';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const moduleFileExtensions = [
  'web.mjs',
  'mjs',
  'web.js',
  'js',
  'web.ts',
  'ts',
  'web.tsx',
  'tsx',
  'json',
  'web.jsx',
  'jsx',
];

// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find(extension =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`))
  );

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }

  return resolveFn(`${filePath}.js`);
};

// config after eject: we're in ./config/
const part_1 = {
  dotenv: resolveApp('.env'),
  appPath: resolveApp('.'),
  appBuild: resolveApp(buildPath),
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  appIndexJs: resolveModule(resolveApp, 'src/index'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  appTsConfig: resolveApp('tsconfig.json'),
  appJsConfig: resolveApp('jsconfig.json'),
  yarnLockFile: resolveApp('yarn.lock'),
  testsSetup: resolveModule(resolveApp, 'src/setupTests'),
  proxySetup: resolveApp('src/setupProxy.js'),
  appNodeModules: resolveApp('node_modules'),
  appWebpackCache: resolveApp('node_modules/.cache'),
  appTsBuildInfoFile: resolveApp('node_modules/.cache/tsconfig.tsbuildinfo'),
  swSrc: resolveModule(resolveApp, 'src/service-worker'),
};

// @remove-on-eject-begin
const resolveOwn = relativePath => path.resolve(__dirname, '..', relativePath);

// config before eject: we're in ./node_modules/react-scripts/config/
const part_2 =  {
  dotenv: resolveApp('.env'),
  appPath: resolveApp('.'),
  appBuild: resolveApp(buildPath),
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  appIndexJs: resolveModule(resolveApp, 'src/index'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  appTsConfig: resolveApp('tsconfig.json'),
  appJsConfig: resolveApp('jsconfig.json'),
  yarnLockFile: resolveApp('yarn.lock'),
  testsSetup: resolveModule(resolveApp, 'src/setupTests'),
  proxySetup: resolveApp('src/setupProxy.js'),
  appNodeModules: resolveApp('node_modules'),
  appWebpackCache: resolveApp('node_modules/.cache'),
  appTsBuildInfoFile: resolveApp('node_modules/.cache/tsconfig.tsbuildinfo'),
  swSrc: resolveModule(resolveApp, 'src/service-worker'),
  // These properties only exist before ejecting:
  ownPath: resolveOwn('.'),
  ownNodeModules: resolveOwn('node_modules'), // This is empty on npm 3
  appTypeDeclarations: resolveApp('src/react-app-env.d.ts'),
  ownTypeDeclarations: resolveOwn('lib/react-app.d.ts'),
};

// const ownPackageJson = require('../package.json');
// const reactScriptsPath = resolveApp(`node_modules/${ownPackageJson.name}`);
// const reactScriptsLinked =
//   fs.existsSync(reactScriptsPath) &&
//   fs.lstatSync(reactScriptsPath).isSymbolicLink();

// config before publish: we're in ./packages/react-scripts/config/
// if (
//   !reactScriptsLinked &&
//   __dirname.indexOf(path.join('packages', 'react-scripts', 'config')) !== -1
// ) {
//   const templatePath = '../cra-template/template';
//   module.exports = {
//     dotenv: resolveOwn(`${templatePath}/.env`),
//     appPath: resolveApp('.'),
//     appBuild: resolveOwn(path.join('../..', buildPath)),
//     appPublic: resolveOwn(`${templatePath}/public`),
//     appHtml: resolveOwn(`${templatePath}/public/index.html`),
//     appIndexJs: resolveModule(resolveOwn, `${templatePath}/src/index`),
//     appPackageJson: resolveOwn('package.json'),
//     appSrc: resolveOwn(`${templatePath}/src`),
//     appTsConfig: resolveOwn(`${templatePath}/tsconfig.json`),
//     appJsConfig: resolveOwn(`${templatePath}/jsconfig.json`),
//     yarnLockFile: resolveOwn(`${templatePath}/yarn.lock`),
//     testsSetup: resolveModule(resolveOwn, `${templatePath}/src/setupTests`),
//     proxySetup: resolveOwn(`${templatePath}/src/setupProxy.js`),
//     appNodeModules: resolveOwn('node_modules'),
//     appWebpackCache: resolveOwn('node_modules/.cache'),
//     appTsBuildInfoFile: resolveOwn('node_modules/.cache/tsconfig.tsbuildinfo'),
//     swSrc: resolveModule(resolveOwn, `${templatePath}/src/service-worker`),
//     // These properties only exist before ejecting:
//     ownPath: resolveOwn('.'),
//     ownNodeModules: resolveOwn('node_modules'),
//     appTypeDeclarations: resolveOwn(`${templatePath}/src/react-app-env.d.ts`),
//     ownTypeDeclarations: resolveOwn('lib/react-app.d.ts'),
//   };
// }
// @remove-on-eject-end

export default moduleFileExtensions;
export { part_1, part_2 }