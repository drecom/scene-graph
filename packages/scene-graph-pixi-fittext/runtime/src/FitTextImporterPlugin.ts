import { ImporterPlugin } from "@drecom/scene-graph-mediator-rt";
import { Node } from "@drecom/scene-graph-schema";
import { FitText } from "@drecom/pixi-fittext";

export class FitTextImporterPlugin implements ImporterPlugin {
  /**
   * Plugin interface implementation
   * Custom extension for runtime object
   */
  public extendRuntimeObjects(): void {}

  /**
   * Plugin interface implementation
   * Custom extension for runtime object
   */
  public createRuntimeObject(node: Node, _: any): any | null {
    const isFitText = node.text && node.text.fitText;

    if (!isFitText) {
      return null;
    }

    const component = node.text!;
    const text = component.text;
    const fitText = component.fitText;
    const nodeStyle = component.style;
    const style = new PIXI.TextStyle({});

    if (nodeStyle) {
      style.fontSize = nodeStyle.size || 26;
      style.fill = nodeStyle.color || 'black';
      switch (nodeStyle.horizontalAlign) {
        case 2: style.align = 'right'; break;
        case 1: style.align = 'center'; break;
        case 0:
        default: style.align = 'left'; break;
      }
    }

    return new FitText(text || '', fitText.requiredWidth, style);
  }
}

export default FitTextImporterPlugin;
