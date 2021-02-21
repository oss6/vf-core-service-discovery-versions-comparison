import fs from 'fs-extra';
import path from 'path';
import LMIFY from 'lmify';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default async (rootDirectory, dataFileName, logStream) => {
  let data;

  if (typeof dataFileName === 'object') {
    data = JSON.parse(await fs.promises.readFile(dataFileName, 'utf-8'));
  } else {
    data = JSON.parse(JSON.stringify(dataFileName));
  }

  const buildDirectory = path.join(rootDirectory, 'build');
  const componentsOldDirectory = path.join(rootDirectory, 'components-old');
  const componentsOldVisualFrameworkDirectory = path.join(
    componentsOldDirectory,
    'node_modules',
    '@visual-framework',
  );
  const componentsLatestDirectory = path.join(rootDirectory, 'components-latest');
  const componentsLatestVisualFrameworkDirectory = path.join(
    componentsLatestDirectory,
    'node_modules',
    '@visual-framework',
  );

  await fs.promises.mkdir(buildDirectory);

  // Download components
  logStream.push('Downloading components');
  await fs.promises.mkdir(componentsOldDirectory);
  await fs.promises.writeFile(path.join(componentsOldDirectory, 'package.json'), '{"private": true}', 'utf-8');
  await fs.mkdir(componentsLatestDirectory);
  await fs.promises.writeFile(path.join(componentsLatestDirectory, 'package.json'), '{"private": true}', 'utf-8');

  const lmifyInstance = new LMIFY({
    stdout: 'ignore',
    packageManager: 'yarn',
  });

  logStream.push('Installing latest components');
  lmifyInstance.setRootDir(componentsLatestDirectory);
  await lmifyInstance.install(data.components.map((c) => c.name));

  logStream.push('Installing old/used components');
  lmifyInstance.setRootDir(componentsOldDirectory);
  await lmifyInstance.install(data.components.map((c) => `${c.name}@${c.installedVersion}`));

  // Merge components versions, postfixing the installed versions with '-old'
  logStream.push('Renaming old components');
  const oldComponents = await fs.promises.readdir(componentsOldVisualFrameworkDirectory);

  await Promise.all(oldComponents.map(async (componentName) => {
    const newComponentDirectoryName = path.join(componentsOldVisualFrameworkDirectory, `${componentName}-old`);

    await fs.promises.rename(
      path.join(componentsOldVisualFrameworkDirectory, componentName),
      newComponentDirectoryName,
    );

    const newComponentDirectory = await fs.promises.readdir(newComponentDirectoryName);

    await Promise.all(newComponentDirectory
      .filter((f) => f.includes(componentName))
      .map(async (fileName) => {
        // eslint-disable-next-line no-useless-escape
        const regex = new RegExp(`(${componentName})\.(.*)`, 'g');
        const matches = regex.exec(fileName);

        if (!matches) {
          throw new Error('An error has occurred when renaming the components.');
        }

        // TODO: check for .js as well
        if (fileName.endsWith('.config.yml')) {
          let configContents = await fs.promises.readFile(path.join(newComponentDirectoryName, fileName), 'utf-8');

          configContents = configContents
            .replace(/title: (.*)/g, 'title: $1 (old)')
            .replace(/label: (.*)/g, 'label: $1 (old)');

          await fs.promises.writeFile(path.join(newComponentDirectoryName, fileName), configContents, 'utf-8');
        }

        await fs.promises.rename(
          path.join(newComponentDirectoryName, fileName),
          path.join(newComponentDirectoryName, `${matches[1]}-old.${matches[2]}`),
        );
      }));
  }));

  const componentsDirectory = path.join(rootDirectory, 'components');

  await fs.promises.mkdir(componentsDirectory);

  await fs.copy(componentsLatestVisualFrameworkDirectory, componentsDirectory);
  await fs.copy(componentsOldVisualFrameworkDirectory, componentsDirectory);

  // Copy preview templates
  await fs.promises.copyFile(path.join(dirname, '_preview.template.njk'), path.join(componentsDirectory, '_preview.njk'));
  await fs.promises.copyFile(path.join(dirname, '_preview--nogrid.template.njk'), path.join(componentsDirectory, '_preview--nogrid.njk'));
  await fs.promises.copyFile(path.join(dirname, '_preview--body.template.njk'), path.join(componentsDirectory, '_preview--body.njk'));
  await fs.promises.copyFile(path.join(dirname, '_preview--fullhtml.template.njk'), path.join(componentsDirectory, '_preview--fullhtml.njk'));
};
