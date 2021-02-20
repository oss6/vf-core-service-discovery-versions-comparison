# vf-core-service-discovery-versions-comparison

Runs a comparison of [vf-core](https://github.com/visual-framework/vf-core) components' versions.

It's main usage comes after the analysis done during service discovery using [vf-core-service-discovery](https://github.com/oss6/vf-core-service-discovery).

## Install

```
$ npm i vf-core-service-discovery-versions-comparison
```

or

```
$ yarn add vf-core-service-discovery-versions-comparison
```

## Basic usage

### CLI

```
$ vf-core-service-discovery-vc --output=/path/to/directory --data=/path/to/data.json
```

The data should be in the following format (see `data.example.json`):

```
{
  "vfCoreVersion": "v2.4.6",
  "components": [
    {
      "name": "@visual-framework/vf-footer",
      "nameWithoutPrefix": "vf-footer",
      "installedVersion": "1.0.4",
      "latestVersion": "1.1.0"
    },
    ...
  ]
}
```

### Module

```
async function compare() {
  const vfCoreComponentsCompareVersions = require('vf-core-service-discovery-versions-comparison');

  await vfCoreComponentsCompareVersions('/path/to/output/directory', '/path/to/data/json');
}

compare();
```
