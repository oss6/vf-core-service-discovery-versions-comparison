const fs = require('fs-extra');
const path = require('path');
const frctl = require('@frctl/fractal');
const frctlNunjucks = require('@frctl/nunjucks');
const codeblock = require('@visual-framework/vf-frctl-extensions/codeblock.js');
const spaceless = require('@visual-framework/vf-frctl-extensions/spaceless.js');
const markdown = require('@visual-framework/vf-frctl-extensions/markdown.js');
const vfTheme = require('@frctl/mandelbrot');

module.exports = (rootDirectory) => {
  const fractal = frctl.create();
  const logger = fractal.cli.console;

  fractal.set('project.title', 'vf-core components versions comparison');

  const vfComponentPath = path.join(rootDirectory, 'components');
  fractal.components.set('path', vfComponentPath);

  const nunj = frctlNunjucks({
    env: {
      lstripBlocks: true,
      trimBlocks: true,
      autoescape: false,
    },
    filters: {
      // {{ "## Parse me" | marked }}
      // marked: function(string) {
      //   const renderMarkdown = require('marked');
      //   return renderMarkdown(string);
      // },
      // A filter and non-async version of frctl's context extension from
      // https://github.com/frctl/nunjucks/blob/develop/src/extensions/context.js
      // We mainly use this to make a component's YAML data available to REAMDE.md
      // {% set context = '@vf-heading' | componentContexts %}
      // componentContexts:  function(component) {
      //   const source = fractal.components;
      //   const handle = component;
      //   const entity = source.find(handle);
      //   if (!entity) {
      //     throw new Error(`Could not render component '${handle}' - component not found.`);
      //   }
      // eslint-disable-next-line max-len
      //   const context = entity.isComponent ? entity.variants().default().context : entity.context;
      //   return context;
      // },
      // hextorgb: module.exports = function(text) {
      //   function hexToRGB(hex) {
      //     var r = parseInt(hex.slice(1, 3), 16),
      //         g = parseInt(hex.slice(3, 5), 16),
      //         b = parseInt(hex.slice(5, 7), 16);
      //     return "rgb(" + r + ", " + g + ", " + b + ")";
      //   }

      //   var hex = new String(text);

      //   return hexToRGB(hex);
      // }
    },
    extensions: {
      codeblock: codeblock(fractal),
      spaceless: spaceless(fractal),
      markdown: markdown(fractal),
    },
  });

  fractal.components.set('ext', '.njk');
  fractal.components.engine(nunj);

  fractal.components.set('default.status', 'alpha');
  fractal.components.set('default.preview', '@preview');

  fractal.set('components.resources.assets.match', [
    '**/*.njk',
    '**/*.config.yml',
    '**/*.scss',
    '**/CHANGELOG.md',
    '**/*.js',
    '**/*.css',
    '!**/*.precompiled.js',
    '!**/package.variables.scss',
    '!**/index.scss',
  ]);

  const vfStaticPath = path.join(rootDirectory, 'build', 'assets');

  if (!fs.existsSync(vfStaticPath)) {
    fs.mkdirpSync(vfStaticPath);
  }

  fractal.web.set('server.sync', true);

  fractal.web.set('server.syncOptions', {
    open: true,
    browser: 'default',
    sync: true,
    serveStatic: [
      {
        route: '/assets',
        dir: path.join(rootDirectory, 'assets'),
      },
    ],
  });

  const vfThemeConfig = vfTheme({}, fractal);

  fractal.components.set('statuses', {
    /* status definitions here */
    alpha: {
      label: 'alpha',
      description: 'Do not implement.',
      color: '#DC0A28',
      text: '#FFFFFF',
    },
    beta: {
      label: 'beta',
      description: 'Work in progress. Implement with caution.',
      color: '#E89300',
    },
    live: {
      label: 'live',
      description: 'Ready to implement.',
      color: '#19993B',
    },
    deprecated: {
      label: 'deprecated',
      description: 'Never use this again.',
      color: '#707372',
    },
  });

  fractal.web.theme(vfThemeConfig);

  fractal.set('project.environment.local', 'true');

  const fractalServer = fractal.web.server({
    sync: true,
  });

  fractalServer.start().then(() => {
    logger.success(`vf-core components versions comparison is available at ${fractalServer.url}`);
    fractal.watch();
  });
};
