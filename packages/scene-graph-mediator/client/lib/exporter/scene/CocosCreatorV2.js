"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var CocosCreator_1 = require("./CocosCreator");
/**
 * CocosCreator v2.x scene exporter
 */
var CocosCreatorV2 = /** @class */ (function (_super) {
    __extends(CocosCreatorV2, _super);
    function CocosCreatorV2() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Returns runtime identifier string.
     */
    CocosCreatorV2.prototype.getIdentifier = function () {
        return 'cocoscreatorv2';
    };
    /**
     * Returns object with Transform schema using Cocos Node data.
     */
    CocosCreatorV2.prototype.createDefaultTransform = function (component) {
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
    return CocosCreatorV2;
}(CocosCreator_1.default));
exports.default = CocosCreatorV2;
//# sourceMappingURL=CocosCreatorV2.js.map