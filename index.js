import fs from 'fs-extra';
import path from 'path';
import rimraf from 'rimraf';
import { promisify } from 'util';
import installComponents from './01-install-components.js';
import buildAssets from './02-build-assets.js';
import runFractal from './03-fractal.js';

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

export default async (rootDirectory, data, logStream) => {
  await clean(rootDirectory, logStream);
  await installComponents(rootDirectory, data, logStream);
  await buildAssets(rootDirectory, logStream);
  await runFractal(rootDirectory, logStream);
};
