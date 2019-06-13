import { SchemaJson, Node } from '@drecom/scene-graph-schema';
import { ImportOption } from '../importer/Importer';

export default interface ImporterPlugin {
  // Use if you want to customize the creation of runtime objects.
  // When multiple plug-ins are set, the one registered first is prioritized.
  createRuntimeObject?(node: Node, resources: any): any | null;

  extendRuntimeObjects(
    schema: SchemaJson,
    nodeMap: Map<string, Node>,
    runtimeObjectMap: Map<string, any>,
    option: ImportOption
  ): void;
}
