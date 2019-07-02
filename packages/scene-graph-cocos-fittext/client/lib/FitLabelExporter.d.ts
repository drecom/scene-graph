import { sgmed } from "@drecom/scene-graph-mediator-cli";
import { SchemaJson, Node as SchemaNode } from "@drecom/scene-graph-schema";
import { Interface as cc } from "@drecom/scene-graph-cocos-cli";
export declare class FitLabelExporter implements sgmed.SceneExporterPlugin {
    extendSceneGraph(outputSceneGraph: SchemaJson, sourceSceneFireJson: any, assetFileMap: sgmed.AssetFileMap): void;
    /**
     * Append supported components to scene graph node
     */
    appendComponents(json: cc.ComponentBase[], graph: SchemaJson, resourceMap: sgmed.AssetFileMap): void;
    colorToHexString(color: {
        r: number;
        g: number;
        b: number;
    }): string;
    /**
     * Detect and append supported component to scene graph node
     */
    appendComponentByType(schemaNode: SchemaNode, component: cc.ComponentBase, _: any): void;
    /**
     * Find node in scene grapph by id
     */
    findSchemaNodeById(graph: SchemaJson, id: string): SchemaNode | null;
}
