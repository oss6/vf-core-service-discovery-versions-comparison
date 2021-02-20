#!/usr/bin/env node
/* eslint-disable no-console */

const argv = require('minimist')(process.argv.slice(2));
const vfCoreServiceDiscoveryVersionsComparison = require('.');

function usage() {
  return 'Usage:\nvf-core-service-discovery-vc -d /path/to/data.json -o /path/to/root/directory';
}

if (argv.h || argv.help) {
  console.log(usage());
  process.exit(0);
}

if ((!argv.output && !argv.o) || (!argv.data && !argv.d)) {
  console.error(usage());
  process.exit(1);
}

const rootDirectory = argv.output || argv.o;
const dataFileName = argv.data || argv.d;

vfCoreServiceDiscoveryVersionsComparison(rootDirectory, dataFileName);
