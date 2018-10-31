import { SchemaJson, Node } from '@drecom/scene-graph-schema';

export default interface ImporterPlugin {
  extendRuntimeObjects(
    schema: SchemaJson,
    nodeMap: Map<string, Node>,
    runtimeObjectMap: Map<string, any>
  ): void;
}
