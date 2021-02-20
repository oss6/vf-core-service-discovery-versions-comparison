#!/usr/bin/env node
/* eslint-disable no-console */

const argv = require('minimist')(process.argv.slice(2));
const vfCoreServiceDiscoveryVersionsComparison = require('.');

function usage() {
  return 'Usage:\nvf-core-service-discovery-vc -p /path/to/data.json -d /path/to/root/directory';
}

if (argv.h || argv.help) {
  console.log(usage());
  process.exit(0);
}

if ((!argv.directory && !argv.p) || (!argv.data && !argv.d)) {
  console.error(usage());
  process.exit(1);
}

const rootDirectory = argv.directory || argv.p;
const dataFileName = argv.data || argv.d;

vfCoreServiceDiscoveryVersionsComparison(rootDirectory, dataFileName);
