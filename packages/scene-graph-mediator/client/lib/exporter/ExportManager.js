"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("../constants");
/**
 * Bundles each export processes and manages running them.
 */
var ExportManager = /** @class */ (function () {
    function ExportManager() {
        /**
         * Plugins placeholder
         */
        this.plugins = {
            assets: new Map(),
            scenes: new Map()
        };
    }
    /**
     * Dyamically loads scene exporter implements
     */
    ExportManager.getSceneExporterClass = function (runtimeId) {
        var id = runtimeId.toLowerCase();
        if (constants_1.RuntimeIdentifiers.COCOS_CREATOR_V1.indexOf(id) !== -1) {
            return require('../exporter/scene/CocosCreator').default;
        }
        else if (constants_1.RuntimeIdentifiers.COCOS_CREATOR_V2.indexOf(id) !== -1) {
            return require('../exporter/scene/CocosCreatorV2').default;
        }
        return null;
    };
    /**
     * Dyamically loads asset exporter implements
     */
    ExportManager.getAssetExporterClass = function (runtimeId) {
        var id = runtimeId.toLowerCase();
        if (constants_1.RuntimeIdentifiers.COCOS_CREATOR_V1.indexOf(id)) {
            return require('../exporter/asset/CocosCreator').default;
        }
        else if (constants_1.RuntimeIdentifiers.COCOS_CREATOR_V2.indexOf(id)) {
            return require('../exporter/asset/CocosCreatorV2').default;
        }
        return null;
    };
    /**
     * Dynamically loads user defined plugin by absolute module path
     */
    ExportManager.prototype.loadPlugins = function (paths) {
        for (var i = 0; i < paths.length; i++) {
            var Plugin = require(paths[i]).default;
            var instance = new Plugin();
            if (instance.replaceExtendedPaths) {
                this.plugins.assets.set(Plugin.name, instance);
            }
            // plugin implementations can be unified
            if (instance.extendSceneGraph) {
                this.plugins.scenes.set(Plugin.name, instance);
            }
        }
    };
    /**
     * Exports scene graphs for given scene file paths
     */
    ExportManager.prototype.exportScene = function (runtimeIdentifier, sceneFiles, assetRoot) {
        var ExporterClass = ExportManager.getSceneExporterClass(runtimeIdentifier);
        if (!ExporterClass) {
            throw new Error("runtime '" + runtimeIdentifier + "' is not supported.");
        }
        var exporter = new ExporterClass();
        var sceneGraphs = exporter.createSceneGraphSchemas(sceneFiles, assetRoot, this.plugins.scenes);
        return sceneGraphs;
    };
    /**
     * Create map for exporting assets
     */
    ExportManager.prototype.exportAsset = function (sceneGraphs, runtimeIdentifier, assetRoot, destDir, urlNameSpace) {
        var ExporterClass = ExportManager.getAssetExporterClass(runtimeIdentifier);
        if (!ExporterClass) {
            throw new Error("runtime '" + runtimeIdentifier + "' is not supported.");
        }
        var exporter = new ExporterClass();
        var exportMap = exporter.createExportMap(sceneGraphs, assetRoot, destDir, urlNameSpace, this.plugins.assets);
        exporter.replacePaths(sceneGraphs, exportMap, this.plugins.assets);
        return exportMap;
    };
    return ExportManager;
}());
exports.default = ExportManager;
//# sourceMappingURL=ExportManager.js.map