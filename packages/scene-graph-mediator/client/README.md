# scene-graph-mediator-cli

This module converts static scene file to scene graph schema.
Each of converters should know scene graph definitions schema of each engine/library, this module provides [CocosCreator](http://www.cocos2d-x.org/creator) exporter by default.

The schema definition of scene graph is based on [@drecom/scene-graph-schema](https://github.com/drecom/scene-graph-schema) .

# Usage

```
$ sgmed
Usage:
  set environment variable as below, then execute lib/index.js with node
    required:
      RUNTIME          runtime identifier, currently supports only 'cc'
      ASSET_ROOT       root directory for assets
      SCENE_FILE       exporting scene file

    optional:
      DEST             destination directory;       default './scene-graph'
      ASSET_NAME_SPACE asset directory name;        default 'assets',
      ASSET_DEST       asset destination directory; default ${DEST}/${ASSET_NAME_SPACE}
      GRAPH_FILE_NAME  scene graph file name;       default 'graph.json',

  e.g;
    RUNTIME=cc ASSET_ROOT=path/to/asset SCENE_FILE=path/to/scene sgmed
```
