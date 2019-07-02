"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
;
var FitLabelExporter = /** @class */ (function () {
    function FitLabelExporter() {
    }
    FitLabelExporter.prototype.extendSceneGraph = function (outputSceneGraph, sourceSceneFireJson, assetFileMap) {
        this.appendComponents(sourceSceneFireJson, outputSceneGraph, assetFileMap);
    };
    /**
     * Append supported components to scene graph node
     */
    FitLabelExporter.prototype.appendComponents = function (json, graph, resourceMap) {
        for (var i = 0; i < json.length; i++) {
            var component = json[i];
            if (!component.node) {
                continue;
            }
            var schemaNode = this.findSchemaNodeById(graph, component.node.__id__.toString());
            if (!schemaNode) {
                continue;
            }
            this.appendComponentByType(schemaNode, component, resourceMap);
        }
    };
    FitLabelExporter.prototype.colorToHexString = function (color) {
        var colorStrs = {
            r: (color.r < 0x10) ? "0" + color.r.toString(16) : color.r.toString(16),
            g: (color.g < 0x10) ? "0" + color.g.toString(16) : color.g.toString(16),
            b: (color.b < 0x10) ? "0" + color.b.toString(16) : color.b.toString(16)
        };
        return "" + colorStrs.r + colorStrs.g + colorStrs.b;
    };
    /**
     * Detect and append supported component to scene graph node
     */
    FitLabelExporter.prototype.appendComponentByType = function (schemaNode, component, _) {
        var fitLabelComponent = component;
        if (!fitLabelComponent._fitToWidth) {
            return;
        }
        var text = {
            text: fitLabelComponent._N$string,
            style: {
                size: fitLabelComponent._fontSize,
                horizontalAlign: fitLabelComponent._N$horizontalAlign
            },
            fitText: {
                requiredWidth: Math.floor(schemaNode.transform.width * schemaNode.transform.scale.x),
            },
        };
        schemaNode.text = text;
        // TODO: alpha
        var colorStr = '#FFFFFF';
        if (schemaNode.renderer && schemaNode.renderer.color) {
            // Label uses node color
            colorStr = "#" + this.colorToHexString(schemaNode.renderer.color);
        }
        schemaNode.text.style.color = colorStr;
    };
    /**
     * Find node in scene grapph by id
     */
    FitLabelExporter.prototype.findSchemaNodeById = function (graph, id) {
        var scene = graph.scene;
        for (var i = 0; i < scene.length; i++) {
            var element = scene[i];
            if (element.id === id) {
                return element;
            }
        }
        return null;
    };
    return FitLabelExporter;
}());
exports.FitLabelExporter = FitLabelExporter;
//# sourceMappingURL=FitLabelExporter.js.map