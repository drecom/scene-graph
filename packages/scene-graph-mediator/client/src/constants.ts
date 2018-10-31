/**
 * Runtime identifiers
 */
export const RuntimeIdentifiers = Object.freeze({
  COCOS_CREATOR_V1: ['cc1', 'cocos1', 'cocoscreator1'],
  COCOS_CREATOR_V2: ['cc', 'cc2', 'cocos', 'cocos2', 'cocoscreator', 'cocoscreator2']
});

/**
 * Help text for CLI
 */
export const CliHelptext = `Usage:
set environment variable as below, then execute lib/index.js with node
required:
  RUNTIME          runtime identifier, currently supports only 'cc'
  ASSET_ROOT       root directory for assets
  SCENE_FILE       exporting scene file

optional:
  DEST             destination directory;        default './scene-graph'
  ASSET_NAME_SPACE asset directory name;         default 'assets'
  ASSET_DEST       asset destination directory;  default \${DEST}/\${ASSET_NAME_SPACE}
  GRAPH_FILE_NAME  scene graph file name;        default 'graph.json'
  PLUGINS          space separated plugin names; default '',

e.g;
RUNTIME=cc ASSET_ROOT=path/to/asset SCENE_FILE=path/to/scene PLUGINS='plugin1 plugin2' sgmed
`;
