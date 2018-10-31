"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Runtime identifiers
 */
exports.RuntimeIdentifiers = Object.freeze({
    COCOS_CREATOR_V1: ['cc1', 'cocos1', 'cocoscreator1'],
    COCOS_CREATOR_V2: ['cc', 'cc2', 'cocos', 'cocos2', 'cocoscreator', 'cocoscreator2']
});
/**
 * Help text for CLI
 */
exports.CliHelptext = "Usage:\nset environment variable as below, then execute lib/index.js with node\nrequired:\n  RUNTIME          runtime identifier, currently supports only 'cc'\n  ASSET_ROOT       root directory for assets\n  SCENE_FILE       exporting scene file\n\noptional:\n  DEST             destination directory;        default './scene-graph'\n  ASSET_NAME_SPACE asset directory name;         default 'assets'\n  ASSET_DEST       asset destination directory;  default ${DEST}/${ASSET_NAME_SPACE}\n  GRAPH_FILE_NAME  scene graph file name;        default 'graph.json'\n  PLUGINS          space separated plugin names; default '',\n\ne.g;\nRUNTIME=cc ASSET_ROOT=path/to/asset SCENE_FILE=path/to/scene PLUGINS='plugin1 plugin2' sgmed\n";
//# sourceMappingURL=constants.js.map