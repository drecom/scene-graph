import { SchemaJson } from '@drecom/scene-graph-schema';
import { sgmed } from '@drecom/scene-graph-mediator-cli';
import * as cc from '../interface/CocosCreator';
import SceneGraphEvent from '../SceneGraphEvent';
export interface SchemaEvent {
    targetId: string;
    type: string;
    callback: string;
    params?: string[];
}
export default class CocosCreator extends SceneGraphEvent {
    extendSceneGraph(graph: SchemaJson, dataSource: cc.NodeBase[], _assetFileMap: sgmed.AssetFileMap): void;
    private createEventComponentMap;
    private extendNodesWithEventComponentMap;
}
