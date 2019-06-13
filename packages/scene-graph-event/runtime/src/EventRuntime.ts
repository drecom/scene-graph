import { SchemaJson, Node } from '@drecom/scene-graph-schema';
import { Event } from '@drecom/event-graph-schema';
import { ImporterPlugin, ImportOption } from '@drecom/scene-graph-mediator-rt';

export type EventAdapter = (event: Event) => Event;

const defaultEventAdapter: EventAdapter = (event: Event): Event => {
  return event;
};

/**
 * Plugin for scene-graph-mediator-rt
 * Handles animation data desceibed in scene-graph-cocos-animation-cli in PIXI runtime
 */
export default class EventRuntime implements ImporterPlugin {
  /**
   * Plugin interface inplementation
   * Custom extension for runtime object
   */
  public extendRuntimeObjects(
    _: SchemaJson,
    nodeMap: Map<string, Node>,
    runtimeObjectMap: Map<string, any>,
    option: ImportOption
  ): void {
    // FIXME: any
    const eventAdapter = (option as any).customEventAdapter || defaultEventAdapter;

    nodeMap.forEach((node, id) => {
      if (!node.events) return;

      const container = runtimeObjectMap.get(id) as PIXI.Container;

      container.interactive = true;

      for (let i = 0; i < node.events.length; i++) {
        const event = node.events[i] as Event;
        const target = runtimeObjectMap.get(event.targetId);
        if (!target) {
          continue;
        }

        const parsedEvent = eventAdapter(event);

        const callback = target[parsedEvent.callback];
        if (!callback) {
          continue;
        }

        if (parsedEvent.params) {
          container.on(parsedEvent.type, () => callback.call(target, ...(parsedEvent.params as string[])));
        } else {
          container.on(parsedEvent.type, () => callback.call(target));
        }
      }
    });
  }
}
