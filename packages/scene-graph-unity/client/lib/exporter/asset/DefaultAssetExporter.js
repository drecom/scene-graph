"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
/**
 * Unity scene exporter
 */
var DefaultAssetExporter = /** @class */ (function () {
    function DefaultAssetExporter() {
    }
    /**
     * Returns runtime identifier string.
     */
    DefaultAssetExporter.prototype.getIdentifier = function () {
        return 'unity';
    };
    /**
     * Create asset export map.
     */
    DefaultAssetExporter.prototype.createExportMap = function (sceneGraphMap, assetRoot, destDir, urlNameSpace, plugins) {
        var _this = this;
        var exportMap = new Map();
        sceneGraphMap.forEach(function (graph) {
            var scene = graph.scene;
            scene.forEach(function (node) {
                _this.forEachExportingAsset(node, function (_owner, _key, path, parentAsset) {
                    var movePath = '';
                    if (parentAsset) {
                        var assetPaths = path.split('/');
                        if (assetPaths.length > 0) {
                            var parentAssetPaths = parentAsset.split('/');
                            parentAssetPaths.pop();
                            parentAssetPaths.push(assetPaths.pop());
                            movePath = parentAssetPaths.join('/');
                        }
                    }
                    var entity = _this.createExportMapEntity(path, assetRoot, destDir, urlNameSpace, movePath);
                    exportMap.set(path, entity);
                });
                _this.pluginPostProcess(node, exportMap, assetRoot, destDir, urlNameSpace, plugins);
            });
        });
        return exportMap;
    };
    DefaultAssetExporter.prototype.pluginPostProcess = function (node, exportMap, assetRoot, destDir, urlNameSpace, plugins) {
        var _this = this;
        if (!plugins) {
            return;
        }
        plugins.forEach(function (plugin) {
            plugin.getExportMapExtendPaths(node).forEach(function (path) {
                var entity = _this.createExportMapEntity(path, assetRoot, destDir, urlNameSpace);
                exportMap.set(path, entity);
            });
        });
    };
    /**
     * Replace paths in scene graph from absolute local path to relative path/url.
     */
    DefaultAssetExporter.prototype.replacePaths = function (sceneGraphMap, exportMap, plugins) {
        var _this = this;
        /**
         * replace local path with url
         */
        sceneGraphMap.forEach(function (sceneGraph) {
            sceneGraph.scene.forEach(function (node) {
                _this.forEachExportingAsset(node, function (owner, key, path) {
                    var entity = exportMap.get(path);
                    if (entity) {
                        owner[key] = entity.url;
                    }
                });
            });
        });
        if (!plugins)
            return;
        plugins.forEach(function (plugin) {
            plugin.replaceExtendedPaths(sceneGraphMap, exportMap);
        });
    };
    /**
     * iterate exporting assets
     */
    DefaultAssetExporter.prototype.forEachExportingAsset = function (node, proc) {
        if (node.meshRenderer) {
            if (node.meshRenderer.mesh) {
                proc(node.meshRenderer.mesh, 'url', node.meshRenderer.mesh.url);
                if (node.meshRenderer.materials) {
                    node.meshRenderer.materials.forEach(function (material) {
                        proc(material, 'url', material.url, node.meshRenderer.mesh.url);
                    });
                }
            }
        }
    };
    /**
     * Create asset export map entity.
     */
    DefaultAssetExporter.prototype.createExportMapEntity = function (basePath, assetRoot, destDir, urlNameSpace, movePath) {
        if (movePath === void 0) { movePath = ''; }
        var destRelativePath = (movePath || basePath).replace(RegExp("^" + assetRoot), '');
        return {
            localSrcPath: basePath,
            localDestPath: path.join(destDir, destRelativePath),
            url: path.join(urlNameSpace, destRelativePath)
        };
    };
    return DefaultAssetExporter;
}());
exports.default = DefaultAssetExporter;
//# sourceMappingURL=DefaultAssetExporter.js.map