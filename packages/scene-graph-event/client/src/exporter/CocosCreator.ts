import { SchemaJson } from '@drecom/scene-graph-schema';
import { sgmed } from '@drecom/scene-graph-mediator-cli';

import * as cc from '../interface/CocosCreator';

import SceneGraphEvent from '../SceneGraphEvent';

// event-graph-schema
export interface SchemaEvent {
  targetId: string;
  type: string;
  callback: string;
  params?: string[];
}

let eventConverter = (clickEvent: cc.Event): SchemaEvent => {
  const defaultObject: SchemaEvent = {
    targetId: clickEvent.target.__id__.toString(),
    type: 'touchend',
    callback: clickEvent.handler
  };

  if (clickEvent.customEventData) {
    defaultObject.params = [clickEvent.customEventData];
  }

  return defaultObject;
};

if (process.env.EVENT_CONVERTER) {
  eventConverter = require(process.env.EVENT_CONVERTER);
}

type EventComponentMap = Map<string, SchemaEvent[]>;

export default class CocosCreator extends SceneGraphEvent {

  public extendSceneGraph(graph: SchemaJson, dataSource: cc.NodeBase[], _assetFileMap: sgmed.AssetFileMap): void {
    const map = this.createEventComponentMap(dataSource);
    this.extendNodesWithEventComponentMap(graph, map);
  }

  private createEventComponentMap(dataSource: cc.NodeBase[]): EventComponentMap {
    const map = new Map<string, SchemaEvent[]>();

    for (let i = 0; i < dataSource.length; i++) {
      const nodeBase = dataSource[i];
      for (let j = 0; j < cc.EventComponentTypeNames.length; j++) {
        const name = cc.EventComponentTypeNames[j];
        if (nodeBase.__type__ !== name) continue;

        const events = [];
        const eventNode = (nodeBase as cc.EventNode);

        for (let k = 0; k < eventNode.clickEvents.length; k++) {
          const eventNodeId = eventNode.clickEvents[k].__id__;
          events.push(eventConverter(dataSource[eventNodeId] as cc.ClickEvent));
        }
        if (events.length > 0) {
          map.set(eventNode.node.__id__.toString(), events);
        }
      }
    }

    return map;
  }

  private extendNodesWithEventComponentMap(graph: SchemaJson, map: EventComponentMap): void {
    map.forEach((events, id) => {
      for (let i = 0; i < graph.scene.length; i++) {
        const node = graph.scene[i];
        if (node.id !== id) continue;
        node.events = events;
      }
    });
  }
}
