/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface DefinitionsNodeJson {
  [k: string]: any;
}
/**
 * This interface was referenced by `DefinitionsNodeJson`'s JSON-Schema
 * via the `definition` "Node".
 */
export interface Node {
  id: string;
  name: string;
  constructorName: string;
  transform: Transform;
  renderer?: Renderer;
  spine?: Spine;
  sprite?: Sprite;
  text?: Text;
  layout?: Layout;
  canvas?: Canvas;
  [k: string]: any;
}
export interface Transform {
  width?: number;
  height?: number;
  x: number;
  y: number;
  rotation?: number;
  scale?: {
    x: number;
    y: number;
    [k: string]: any;
  };
  anchor: {
    x: number;
    y: number;
    [k: string]: any;
  };
  parent?: string;
  children?: string[];
  [k: string]: any;
}
export interface Renderer {
  color?: {
    r: number;
    g: number;
    b: number;
    a: number;
    [k: string]: any;
  };
  [k: string]: any;
}
export interface Spine {
  url: string;
  skin: string;
  animation?: {
    name: string;
    loop?: boolean;
    offset?: number;
    [k: string]: any;
  };
  [k: string]: any;
}
export interface Sprite {
  url?: string;
  base64?: string;
  atlasUrl?: string;
  frameName?: string;
  slice?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    [k: string]: any;
  };
  [k: string]: any;
}
export interface Text {
  text: string;
  style: {
    size?: number;
    horizontalAlign?: number;
    color?: string;
    [k: string]: any;
  };
  [k: string]: any;
}
export interface Layout {
  layoutSize?: {
    width: number;
    height: number;
    [k: string]: any;
  };
  resize: number;
  layoutType: number;
  cellSize?: {
    width: number;
    height: number;
    [k: string]: any;
  };
  startAxis?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  spacingX?: number;
  spacingY?: number;
  verticalDirection?: number;
  horizontalDirection?: number;
  [k: string]: any;
}
export interface Canvas {
  designResolution: {
    width: number;
    height: number;
    [k: string]: any;
  };
  [k: string]: any;
}
