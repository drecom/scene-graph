import { ImporterPlugin } from "@drecom/scene-graph-mediator-rt";
import { Node } from "@drecom/scene-graph-schema";
export declare class FitTextImporterPlugin implements ImporterPlugin {
    /**
     * Plugin interface implementation
     * Custom extension for runtime object
     */
    extendRuntimeObjects(): void;
    /**
     * Plugin interface implementation
     * Custom extension for runtime object
     */
    createRuntimeObject(node: Node, _: any): any | null;
}
export default FitTextImporterPlugin;
