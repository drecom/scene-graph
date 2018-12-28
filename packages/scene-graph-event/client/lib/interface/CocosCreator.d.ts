export interface NodeId {
    __id__: number;
}
export interface NodeBase {
    __type__: string;
}
export interface Node extends NodeBase {
    _components?: Node[];
    node: NodeId;
}
export interface EventNode extends Node {
    clickEvents: NodeId[];
}
export interface Event extends NodeBase {
    target: NodeId;
    component: string;
    handler: string;
    customEventData: string;
}
export interface ClickEvent extends Event {
}
export declare const EventComponentTypeNames: string[];
