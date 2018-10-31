"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
/**
 * Elements of AssetFileMap.
 * It contains file path and some modification methods.
 */
var AssetFileEntity = /** @class */ (function () {
    /**
     * Constructor throws exception when given path is invalid as absolute path.
     */
    function AssetFileEntity(absolutePath) {
        if (!path.isAbsolute(absolutePath)) {
            throw new Error('AssetFileEntity only accepts absolute path as constructor argument');
        }
        this.filePath = absolutePath;
    }
    Object.defineProperty(AssetFileEntity.prototype, "extension", {
        /**
         * Returns file extension including period (.).
         */
        get: function () {
            return path.extname(this.filePath);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Change absolute path to relative path based on given path.
     */
    AssetFileEntity.prototype.relativeLocalPath = function (basePath) {
        return this.filePath.replace(basePath, '').replace(/^\//, '');
    };
    return AssetFileEntity;
}());
exports.default = AssetFileEntity;
//# sourceMappingURL=AssetFileEntity.js.map