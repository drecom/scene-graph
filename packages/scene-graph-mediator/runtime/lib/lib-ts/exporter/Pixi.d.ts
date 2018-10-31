import { SchemaJson, Node } from '@drecom/scene-graph-schema';
import Exporter from 'exporter/Exporter';
/**
 * Abstract class for runtime mediation.<br />
 * It handles runtime object like Unity's GameObject or Cocos's Node
 */
export default class Pixi extends Exporter {
    createSchema(scene: any, width: number, height: number): SchemaJson;
    createNode(base: any): Node;
    private createNodeRecursive;
}
