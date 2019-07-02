import { sgmed } from "@drecom/scene-graph-mediator-cli";
import { SchemaJson, Node as SchemaNode, Text } from "@drecom/scene-graph-schema";
import { Interface as cc } from "@drecom/scene-graph-cocos-cli";

// for import
interface FitLabel extends cc.Label {
  _fitToWidth: boolean;
};

// for export
interface FitText extends Text {
  fitText: {
    requiredWidth: number;
  }
};

export class FitLabelExporter implements sgmed.SceneExporterPlugin {
  extendSceneGraph(outputSceneGraph: SchemaJson, sourceSceneFireJson: any, assetFileMap: sgmed.AssetFileMap) {
    this.appendComponents(sourceSceneFireJson, outputSceneGraph, assetFileMap);
  }

  /**
   * Append supported components to scene graph node
   */
  appendComponents(
    json: cc.ComponentBase[],
    graph: SchemaJson,
    resourceMap: sgmed.AssetFileMap
  ) {
    for (let i = 0; i < json.length; i++) {
      const component = json[i] as cc.Component;
      if (!component.node) {
        continue;
      }

      const schemaNode = this.findSchemaNodeById(graph, component.node.__id__.toString());
      if (!schemaNode) {
        continue;
      }

      this.appendComponentByType(schemaNode, component, resourceMap);
    }
  }

  colorToHexString(color: {r: number, g: number, b: number }) {
    const colorStrs = {
      r: (color.r < 0x10) ? `0${color.r.toString(16)}` : color.r.toString(16),
      g: (color.g < 0x10) ? `0${color.g.toString(16)}` : color.g.toString(16),
      b: (color.b < 0x10) ? `0${color.b.toString(16)}` : color.b.toString(16)
    };
    return `${colorStrs.r}${colorStrs.g}${colorStrs.b}`;
  }

  /**
   * Detect and append supported component to scene graph node
   */
  appendComponentByType(
    schemaNode: SchemaNode,
    component: cc.ComponentBase,
    _: any
  ) {
    const fitLabelComponent = component as FitLabel;

    if(!fitLabelComponent._fitToWidth) {
      return;
    }

    const text: FitText = {
      text: fitLabelComponent._N$string,
      style: {
        size: fitLabelComponent._fontSize,
        horizontalAlign: fitLabelComponent._N$horizontalAlign
      },
      fitText: {
        requiredWidth: Math.floor(schemaNode.transform!.width! * schemaNode.transform!.scale!.x),
      },
    };
    schemaNode.text = text;

    // TODO: alpha
    let colorStr = '#FFFFFF';
    if (schemaNode.renderer && schemaNode.renderer.color) {
      // Label uses node color
      colorStr = `#${this.colorToHexString(schemaNode.renderer.color)}`;
    }

    schemaNode.text.style.color = colorStr;
  }

  /**
   * Find node in scene grapph by id
   */
  findSchemaNodeById(graph: SchemaJson, id: string) {
    const scene = graph.scene;
    for (let i = 0; i < scene.length; i++) {
      const element = scene[i];
      if (element.id === id) {
        return element;
      }
    }

    return null;
  }
}
