import { SchemaJson, Node } from '@drecom/scene-graph-schema';
import { sgmed } from '@drecom/scene-graph-mediator-cli';
declare namespace Fire {
    type NodeId = {
        __id__: number;
    };
    type Node = {
        __type__: string;
        _components?: Node[];
        node: NodeId;
    };
    type AnimationFrame = {
        frame: number;
        value: {
            [key: string]: number;
        };
        curve?: number[] | string;
    };
    type Animation = {
        sample: number;
        speed: number;
        curveData: {
            props: {
                [key: string]: AnimationFrame[];
            };
        };
    };
    type AnimationComponentReference = Node & {
        _defaultClip: {
            __uuid__: string;
        };
        _clips: {
            __uuid__: string;
        }[];
        playOnLoad: boolean;
    };
}
export default class SceneGraphAnimation implements sgmed.SceneExporterPlugin, sgmed.AssetExporterPlugin {
    static readonly AnimationFileExt = "anim";
    static readonly MetaFileExt = "meta";
    extendSceneGraph(graph: SchemaJson, dataSource: Fire.Node[], assetFileMap: sgmed.AssetFileMap): void;
    replaceExtendedPaths(sceneGraphMap: Map<string, SchemaJson>, exportMap: Map<string, sgmed.AssetExportMapEntity>): void;
    getExportMapExtendPaths(node: Node): string[];
    private collectAnimationFiles;
    private collectAnimationNodes;
    private extendNodeWithAnimationComponent;
    private createAnimationFrames;
}
export {};
