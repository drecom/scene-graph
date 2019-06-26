scene-graph-pixi-fittext-rt is plugin for @drecom/scene-graph-pixi-rt.
This module restores scene-graph coverted with @drecom/scene-graph-cocos-fittext-cli.

It is a premise used for game project using pixi.js.

## Install

```
# dependency
npm install @drecom/scene-graph-pixi-rt

# install this module
npm install @drecom/scene-graph-pixi-fittext-rt
```

## Usage

Just add plugins when using @drecom/scene-graph-pixi-rt.

```
import { Pixi as PixiImporter } from "@drecom/scene-graph-pixi-rt";
import { FitTextImporterPlugin, FitText } from "@drecom/scene-graph-pixi-fittext-rt";

const importer = new PixiImporter();
importer.addPlugin(new FitTextImporterPlugin());
importer.import(loader.resources["scene-graph.json"].data, (root: any) => this.stage.addChild(root));
```
