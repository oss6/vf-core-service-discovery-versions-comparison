const fs = require('fs-extra');
const path = require('path');
const rimraf = require('rimraf');
const { promisify } = require('util');
const installComponents = require('./01-install-components');
const buildAssets = require('./02-build-assets');
const runFractal = require('./03-fractal');

const rimrafP = promisify(rimraf);

async function clean(rootDirectory) {
  if (!fs.existsSync(rootDirectory)) {
    fs.mkdirSync(rootDirectory);
  } else {
    await rimrafP(path.join(rootDirectory, 'build'));
    await rimrafP(path.join(rootDirectory, 'assets'));
    await rimrafP(path.join(rootDirectory, 'components'));
    await rimrafP(path.join(rootDirectory, 'components-old'));
    await rimrafP(path.join(rootDirectory, 'components-latest'));
  }
}

module.exports = async (rootDirectory, dataFileName) => {
  await clean(rootDirectory);
  await installComponents(rootDirectory, dataFileName);
  await buildAssets(rootDirectory);
  runFractal(rootDirectory);
};
