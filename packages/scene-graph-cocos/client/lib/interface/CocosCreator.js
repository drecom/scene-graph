"use strict";
/**
 * Cocos Creator scene file and meta file dto interface
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaTypes = Object.freeze({
    SCENE: 'cc.Scene',
    CANVAS: 'cc.Canvas',
    NODE: 'cc.Node',
    SPRITE: 'cc.Sprite',
    LABEL: 'cc.Label',
    LAYOUT: 'cc.Layout'
});
// TODO: expose or float this definition, scene-graph-mediator-rt importer may refer this
exports.SpriteType = Object.freeze({
    SIMPLE: 0,
    SLICED: 1,
    TILED: 2,
    FILLED: 3,
    MESH: 4
});
//# sourceMappingURL=CocosCreator.js.map