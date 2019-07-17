/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface DefinitionsScrollViewJson {
  [k: string]: any;
}
/**
 * This interface was referenced by `DefinitionsScrollViewJson`'s JSON-Schema
 * via the `definition` "ScrollView".
 */
export interface ScrollView {
  horizontalBar?: ComponentReference;
  verticalBar?: ComponentReference;
  brake?: number;
  bounseTime?: number;
  isElastic?: boolean;
  isInertia?: boolean;
  [k: string]: any;
}
export interface ComponentReference {
  nodeId: number;
  componentId: number;
  [k: string]: any;
}
