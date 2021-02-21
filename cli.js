#!/usr/bin/env node
/* eslint-disable no-console */

import { PassThrough } from 'stream';
import minimist from 'minimist';
import vfCoreServiceDiscoveryVersionsComparison from './index.js';

(async () => {
  const argv = minimist(process.argv.slice(2));

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

  const logStream = new PassThrough({ encoding: 'utf-8' });

  logStream.on('data', (event) => {
    console.log(event);
  });

  await vfCoreServiceDiscoveryVersionsComparison(rootDirectory, dataFileName, logStream);

  logStream.end();
})();
