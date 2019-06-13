"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var DefaultSceneExporter_1 = require("./DefaultSceneExporter");
/**
 * CocosCreator v2.x scene exporter
 */
var V2SceneExporter = /** @class */ (function (_super) {
    __extends(V2SceneExporter, _super);
    function V2SceneExporter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Returns runtime identifier string.
     */
    V2SceneExporter.prototype.getIdentifier = function () {
        return 'cocoscreatorv2';
    };
    /**
     * Returns object with Transform schema using Cocos Node data.
     */
    V2SceneExporter.prototype.createDefaultTransform = function (component) {
        var node = component;
        return {
            width: node._contentSize.width,
            height: node._contentSize.height,
            x: node._position.x,
            y: node._position.y,
            rotation: node._rotationX,
            scale: {
                // V2 has scale as Vec3
                x: node._scale.x,
                y: node._scale.y
            },
            anchor: {
                x: node._anchorPoint.x,
                y: node._anchorPoint.y
            }
        };
    };
    return V2SceneExporter;
}(DefaultSceneExporter_1.default));
exports.default = V2SceneExporter;
//# sourceMappingURL=V2SceneExporter.js.map