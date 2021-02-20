const fs = require('fs-extra');
const path = require('path');
const { install, setRootDir, setPackageManager } = require('lmify');

module.exports = async (rootDirectory, dataFileName) => {
  const data = JSON.parse(fs.readFileSync(dataFileName, 'utf-8'));
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

  if (!fs.existsSync(buildDirectory)) {
    fs.mkdirSync(buildDirectory);
  }

  // Download components
  console.log('Downloading components...');
  fs.mkdirSync(componentsOldDirectory);
  fs.writeFileSync(path.join(componentsOldDirectory, 'package.json'), '{}', 'utf-8');
  fs.mkdirSync(componentsLatestDirectory);
  fs.writeFileSync(path.join(componentsLatestDirectory, 'package.json'), '{}', 'utf-8');

  data.components.forEach(async (component) => {
    setPackageManager('yarn');
    setRootDir(componentsLatestDirectory);
    await install(component.name);

    setRootDir(componentsOldDirectory);
    await install(`${component.name}@${component.installedVersion}`);
  });

  // Merge components versions, postfixing the installed versions with '-old'
  console.log('Renaming old components...');
  fs.readdirSync(componentsOldVisualFrameworkDirectory).forEach((componentName) => {
    const newComponentDirectoryName = path.join(componentsOldVisualFrameworkDirectory, `${componentName}-old`);

    fs.renameSync(
      path.join(componentsOldVisualFrameworkDirectory, componentName),
      newComponentDirectoryName,
    );

    fs.readdirSync(newComponentDirectoryName)
      .filter((f) => f.includes(componentName))
      .forEach((fileName) => {
        // eslint-disable-next-line no-useless-escape
        const regex = new RegExp(`(${componentName})\.(.*)`, 'g');
        const matches = regex.exec(fileName);

        if (!matches) {
          throw new Error('An error has occurred when renaming the components.');
        }

        // TODO: check for .js as well
        if (fileName.endsWith('.config.yml')) {
          let configContents = fs.readFileSync(path.join(newComponentDirectoryName, fileName), 'utf-8');

          configContents = configContents
            .replace(/title: (.*)/g, 'title: $1 (old)')
            .replace(/label: (.*)/g, 'label: $1 (old)');

          fs.writeFileSync(path.join(newComponentDirectoryName, fileName), configContents, 'utf-8');
        }

        fs.renameSync(
          path.join(newComponentDirectoryName, fileName),
          path.join(newComponentDirectoryName, `${matches[1]}-old.${matches[2]}`),
        );
      });
  });

  const componentsDirectory = path.join(rootDirectory, 'components');

  if (!fs.existsSync(componentsDirectory)) {
    fs.mkdirSync(componentsDirectory);
  }

  fs.copySync(componentsLatestVisualFrameworkDirectory, componentsDirectory);
  fs.copySync(componentsOldVisualFrameworkDirectory, componentsDirectory);

  // Copy preview templates
  fs.copyFileSync(path.join(__dirname, '_preview.template.njk'), path.join(componentsDirectory, '_preview.njk'));
  fs.copyFileSync(path.join(__dirname, '_preview--nogrid.template.njk'), path.join(componentsDirectory, '_preview--nogrid.njk'));
  fs.copyFileSync(path.join(__dirname, '_preview--body.template.njk'), path.join(componentsDirectory, '_preview--body.njk'));
  fs.copyFileSync(path.join(__dirname, '_preview--fullhtml.template.njk'), path.join(componentsDirectory, '_preview--fullhtml.njk'));
};
