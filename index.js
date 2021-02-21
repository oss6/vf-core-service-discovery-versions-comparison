const fs = require('fs-extra');
const path = require('path');
const rimraf = require('rimraf');
const { promisify } = require('util');
const installComponents = require('./01-install-components');
const buildAssets = require('./02-build-assets');
const runFractal = require('./03-fractal');

const rimrafP = promisify(rimraf);

async function clean(rootDirectory, logStream) {
  if (!fs.existsSync(rootDirectory)) {
    await fs.mkdir(rootDirectory);

    logStream.push(`Deleted root directory ${rootDirectory}`);
  } else {
    await rimrafP(path.join(rootDirectory, 'build'));
    await rimrafP(path.join(rootDirectory, 'assets'));
    await rimrafP(path.join(rootDirectory, 'components'));
    await rimrafP(path.join(rootDirectory, 'components-old'));
    await rimrafP(path.join(rootDirectory, 'components-latest'));

    logStream.push(`Deleted cache in root directory ${rootDirectory}`);
  }
}

module.exports = async (rootDirectory, data, logStream) => {
  await clean(rootDirectory, logStream);
  await installComponents(rootDirectory, data, logStream);
  await buildAssets(rootDirectory, logStream);
  await runFractal(rootDirectory, logStream);
};
