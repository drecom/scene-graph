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
var cc = require("../interface/CocosCreator");
var SceneGraphEvent_1 = require("../SceneGraphEvent");
var eventConverter = function (clickEvent) {
    var defaultObject = {
        targetId: clickEvent.target.__id__.toString(),
        type: 'touchend',
        callback: clickEvent.handler
    };
    if (clickEvent.customEventData) {
        defaultObject.params = [clickEvent.customEventData];
    }
    return defaultObject;
};
if (process.env.EVENT_CONVERTER) {
    eventConverter = require(process.env.EVENT_CONVERTER);
}
var CocosCreator = /** @class */ (function (_super) {
    __extends(CocosCreator, _super);
    function CocosCreator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CocosCreator.prototype.extendSceneGraph = function (graph, dataSource, _assetFileMap) {
        var map = this.createEventComponentMap(dataSource);
        this.extendNodesWithEventComponentMap(graph, map);
    };
    CocosCreator.prototype.createEventComponentMap = function (dataSource) {
        var map = new Map();
        for (var i = 0; i < dataSource.length; i++) {
            var nodeBase = dataSource[i];
            for (var j = 0; j < cc.EventComponentTypeNames.length; j++) {
                var name = cc.EventComponentTypeNames[j];
                if (nodeBase.__type__ !== name)
                    continue;
                var events = [];
                var eventNode = nodeBase;
                for (var k = 0; k < eventNode.clickEvents.length; k++) {
                    var eventNodeId = eventNode.clickEvents[k].__id__;
                    events.push(eventConverter(dataSource[eventNodeId]));
                }
                if (events.length > 0) {
                    map.set(eventNode.node.__id__.toString(), events);
                }
            }
        }
        return map;
    };
    CocosCreator.prototype.extendNodesWithEventComponentMap = function (graph, map) {
        map.forEach(function (events, id) {
            for (var i = 0; i < graph.scene.length; i++) {
                var node = graph.scene[i];
                if (node.id !== id)
                    continue;
                node.events = events;
            }
        });
    };
    return CocosCreator;
}(SceneGraphEvent_1.default));
exports.default = CocosCreator;
//# sourceMappingURL=CocosCreator.js.map