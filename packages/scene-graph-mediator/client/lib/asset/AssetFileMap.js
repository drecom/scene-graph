"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var AssetFileEntity_1 = require("./AssetFileEntity");
/**
 * AssetFileMap handles file path based asset list.
 */
var AssetFileMap = /** @class */ (function () {
    /**
     * Constructor throws exception when given path is invalid as absolute path.
     */
    function AssetFileMap(assetRoot) {
        if (!path.isAbsolute(assetRoot)) {
            throw new Error('AssetFileMap accepts only absolute asset root.');
        }
        this.assetRoot = assetRoot;
        this.entities = new Map();
    }
    /**
     * Clear AssetFileEntity map.
     */
    AssetFileMap.prototype.clear = function () {
        this.entities.clear();
    };
    /**
     * Wrapper for entities.get() to keep it readonly.
     */
    AssetFileMap.prototype.get = function (key) {
        return this.entities.get(key);
    };
    /**
     * Wrapper for entities.forEach() to keep it readonly.
     */
    AssetFileMap.prototype.forEach = function (proc) {
        this.entities.forEach(proc);
    };
    /**
     * Scan given path and set entities.
     */
    AssetFileMap.prototype.scan = function (targetPath) {
        if (targetPath === void 0) { targetPath = this.assetRoot; }
        var entities = fs.readdirSync(targetPath);
        for (var i = 0; i < entities.length; i++) {
            var absPath = path.resolve(targetPath, entities[i]);
            if (fs.statSync(absPath).isDirectory()) {
                this.scan(absPath);
            }
            else {
                this.entities.set(absPath, new AssetFileEntity_1.default(absPath));
            }
        }
    };
    return AssetFileMap;
}());
exports.default = AssetFileMap;
//# sourceMappingURL=AssetFileMap.js.map