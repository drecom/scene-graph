# scene-graph-mediator-rt

This module converts both scene graph schema and runtime object each other.
Each of converters should know runtime object schema, this module provides [pixi.js](https://github.com/pixijs/pixi.js) importer/exporter by default.

The schema definition of scene graph is based on [@drecom/scene-graph-schema](https://github.com/drecom/scene-graph-schema) .

# Usage

For most simple example;

```
const importer = new SceneGraph.Importers.Pixi();
importer.import(scenegraphJson, (root) => stage.addChild(root));
```

Building custom import pipeline;

```
const importer = new SceneGraph.Importers.Pixi();

// create asset list to download
const assets = importer.createAssetMap(scenegraphJson);

// load if any asset is required
if (assets.size > 0) {
  assets.forEach((asset) => PIXI.loader.add(asset));
  PIXI.loader.load(() => importer.restoreScene(app.stage, schema));
} else {
  importer.restoreScene(app.stage, schema);
}
```

See example directory for working example.

# Remarks

To shrink runtime code volume, importer/exporter for each runtime may separated from this repository in the future.
