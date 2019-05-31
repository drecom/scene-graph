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
            for (var i = 0; i < scene.length; i++) {
                var node = scene[i];
                if (node.sprite) {
                    if (node.sprite.url) {
                        exportMap.set(node.sprite.url, _this.createExportMapEntity(node.sprite.url, assetRoot, destDir, urlNameSpace));
                    }
                    if (node.sprite.atlasUrl) {
                        exportMap.set(node.sprite.atlasUrl, _this.createExportMapEntity(node.sprite.atlasUrl, assetRoot, destDir, urlNameSpace));
                    }
                }
                if (node.mask && node.mask.spriteFrame) {
                    var maskSprite = node.mask.spriteFrame;
                    if (maskSprite.url) {
                        exportMap.set(maskSprite.url, _this.createExportMapEntity(maskSprite.url, assetRoot, destDir, urlNameSpace));
                    }
                    if (maskSprite.atlasUrl) {
                        exportMap.set(maskSprite.atlasUrl, _this.createExportMapEntity(maskSprite.atlasUrl, assetRoot, destDir, urlNameSpace));
                    }
                }
                _this.pluginPostProcess(node, exportMap, assetRoot, destDir, urlNameSpace, plugins);
            }
        });
        return exportMap;
    };
    CocosCreator.prototype.pluginPostProcess = function (node, exportMap, assetRoot, destDir, urlNameSpace, plugins) {
        var _this = this;
        if (!plugins) {
            return;
        }
        plugins.forEach(function (plugin) {
            var paths = plugin.getExportMapExtendPaths(node);
            if (paths.length === 0)
                return;
            for (var j = 0; j < paths.length; j++) {
                exportMap.set(paths[j], _this.createExportMapEntity(paths[j], assetRoot, destDir, urlNameSpace));
            }
        });
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
                if (node.mask && node.mask.spriteFrame) {
                    if (node.mask.spriteFrame.url) {
                        var entity = exportMap.get(node.mask.spriteFrame.url);
                        if (entity) {
                            node.mask.spriteFrame.url = entity.url;
                        }
                    }
                    if (node.mask.spriteFrame.atlasUrl) {
                        var entity = exportMap.get(node.mask.spriteFrame.atlasUrl);
                        if (entity) {
                            node.mask.spriteFrame.atlasUrl = entity.url;
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