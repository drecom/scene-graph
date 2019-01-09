import { SchemaJson, Node } from '@drecom/scene-graph-schema';
import { Event } from '@drecom/event-graph-schema';
import { ImporterPlugin, ImportOption } from '@drecom/scene-graph-mediator-rt';
export declare type EventAdapter = (event: Event) => Event;
declare module '@drecom/scene-graph-mediator-rt' {
    interface ImportOption {
        customEventAdapter?: EventAdapter;
    }
}
/**
 * Plugin for scene-graph-mediator-rt
 * Handles animation data desceibed in scene-graph-cocos-animation-cli in PIXI runtime
 */
export default class EventRuntime implements ImporterPlugin {
    /**
     * Plugin interface inplementation
     * Custom extension for runtime object
     */
    extendRuntimeObjects(_: SchemaJson, nodeMap: Map<string, Node>, runtimeObjectMap: Map<string, any>, option: ImportOption): void;
}
