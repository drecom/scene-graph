"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
/**
 * CocosCreator scene exporter
 */
var CocosCreator = /** @class */ (function () {
    function CocosCreator() {
    }
    /**
     * Returns runtime identifier string.
     */
    CocosCreator.prototype.getIdentifier = function () {
        return 'cocoscreator';
    };
    /**
     * Create asset export map.
     */
    CocosCreator.prototype.createExportMap = function (sceneGraphMap, assetRoot, destDir, urlNameSpace, plugins) {
        var _this = this;
        var exportMap = new Map();
        sceneGraphMap.forEach(function (graph) {
            var scene = graph.scene;
            var _loop_1 = function (i) {
                var node = scene[i];
                if (node.sprite) {
                    if (node.sprite.url) {
                        exportMap.set(node.sprite.url, _this.createExportMapEntity(node.sprite.url, assetRoot, destDir, urlNameSpace));
                    }
                    if (node.sprite.atlasUrl) {
                        exportMap.set(node.sprite.atlasUrl, _this.createExportMapEntity(node.sprite.atlasUrl, assetRoot, destDir, urlNameSpace));
                    }
                }
                if (!plugins)
                    return "continue";
                plugins.forEach(function (plugin) {
                    var paths = plugin.getExportMapExtendPaths(node);
                    if (paths.length === 0)
                        return;
                    for (var j = 0; j < paths.length; j++) {
                        exportMap.set(paths[j], _this.createExportMapEntity(paths[j], assetRoot, destDir, urlNameSpace));
                    }
                });
            };
            for (var i = 0; i < scene.length; i++) {
                _loop_1(i);
            }
        });
        return exportMap;
    };
    /**
     * Replace paths in scene graph from absolute local path to relative path/url.
     */
    CocosCreator.prototype.replacePaths = function (sceneGraphMap, exportMap, plugins) {
        /**
         * replace local path with url
         */
        sceneGraphMap.forEach(function (sceneGraph) {
            sceneGraph.scene.forEach(function (node) {
                if (node.sprite) {
                    if (node.sprite.url) {
                        var entity = exportMap.get(node.sprite.url);
                        if (entity) {
                            node.sprite.url = entity.url;
                        }
                    }
                    if (node.sprite.atlasUrl) {
                        var entity = exportMap.get(node.sprite.atlasUrl);
                        if (entity) {
                            node.sprite.atlasUrl = entity.url;
                        }
                    }
                }
            });
        });
        if (!plugins)
            return;
        plugins.forEach(function (plugin) {
            plugin.replaceExtendedPaths(sceneGraphMap, exportMap);
        });
    };
    /**
     * Create asset export map entity.
     */
    CocosCreator.prototype.createExportMapEntity = function (basePath, assetRoot, destDir, urlNameSpace) {
        if (urlNameSpace === void 0) { urlNameSpace = ''; }
        var relativePath = basePath.replace(RegExp("^" + assetRoot), '');
        return {
            localSrcPath: basePath,
            localDestPath: path.join(destDir, relativePath),
            url: path.join(urlNameSpace, relativePath)
        };
    };
    return CocosCreator;
}());
exports.default = CocosCreator;
//# sourceMappingURL=CocosCreator.js.map