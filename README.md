# vf-core-service-discovery-versions-comparison

This repository is a template for

## Basic usage

```
$ npm run build -- /path/to/data.json
```

The data should be in the following format:

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
