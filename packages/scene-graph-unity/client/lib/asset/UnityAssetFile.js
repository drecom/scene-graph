"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UnityAssetFile = /** @class */ (function () {
    function UnityAssetFile(assetFile, metaFile) {
        this.asset = '';
        this.meta = '';
        this.asset = assetFile;
        this.meta = metaFile;
    }
    UnityAssetFile.createWithMetaFile = function (metaFile) {
        return new UnityAssetFile(metaFile.replace(UnityAssetFile.metaRegex, ''), metaFile);
    };
    UnityAssetFile.createWithAssetFile = function (assetFile) {
        return new UnityAssetFile(assetFile, assetFile + "." + UnityAssetFile.metaExt);
    };
    UnityAssetFile.isMetaFile = function (file) {
        return UnityAssetFile.metaRegex.test(file);
    };
    UnityAssetFile.metaExt = 'meta';
    UnityAssetFile.metaRegex = new RegExp("." + UnityAssetFile.metaExt + "$");
    return UnityAssetFile;
}());
exports.default = UnityAssetFile;
//# sourceMappingURL=UnityAssetFile.js.map