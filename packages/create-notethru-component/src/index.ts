#! /usr/bin/env node

import init from "./createNotethruComponent.js";

const currentNodeVersion = process.versions.node;
const semver = currentNodeVersion.split('.');
const major = Number(semver[0]);

if (!Number.isInteger(major)) {
  console.error(
    "There was an error while checking your node version. Make sure you have correct node verson i.e. > 14 is installed"
  )
  process.exit(1)
}

if (major < 14) {
  console.error(
    'You are running Node ' +
      currentNodeVersion +
      '.\n' +
      'Create Notethru Component requires Node 14 or higher. \n' +
      'Please update your version of Node.'
  );
  process.exit(1);
}

init()