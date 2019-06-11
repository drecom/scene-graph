import { SchemaJson, Node } from '@drecom/scene-graph-schema';
import { ImportOption } from '../importer/Importer';
export default interface ImporterPlugin {
    createRuntimeObject?(node: Node, resources: any): any | null;
    extendRuntimeObjects(schema: SchemaJson, nodeMap: Map<string, Node>, runtimeObjectMap: Map<string, any>, option: ImportOption): void;
}
