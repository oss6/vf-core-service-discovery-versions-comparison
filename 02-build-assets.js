const fs = require('fs-extra');
const path = require('path');

module.exports = async (rootDirectory, logStream) => {
  const assetsDirectory = path.join(rootDirectory, 'assets');
  const componentsDirectory = path.join(rootDirectory, 'components');

  fs.promises.mkdir(assetsDirectory);

  fs.readdirSync(componentsDirectory).forEach((componentName) => {
    logStream.push(`Moving ${componentName} assets`);

    const componentAssetsDirectory = path.join(assetsDirectory, componentName);
    const componentSourceDirectory = path.join(componentsDirectory, componentName);

    if (!fs.lstatSync(componentSourceDirectory).isDirectory()) {
      return;
    }

    if (!fs.existsSync(componentAssetsDirectory)) {
      fs.mkdirSync(componentAssetsDirectory);
    }

    fs.readdirSync(componentSourceDirectory)
      .filter((f) => f.endsWith('.css') || f.endsWith('.js'))
      .forEach((f) => {
        fs.copyFileSync(
          path.join(componentSourceDirectory, f),
          path.join(componentAssetsDirectory, f),
        );
      });

    if (fs.existsSync(path.join(componentSourceDirectory, 'assets'))) {
      fs.copySync(
        path.join(componentSourceDirectory, 'assets'),
        path.join(componentAssetsDirectory, 'assets'),
      );
    }
  });
};
