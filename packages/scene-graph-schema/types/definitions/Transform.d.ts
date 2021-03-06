/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface DefinitionsTransformJson {
  [k: string]: any;
}
/**
 * This interface was referenced by `DefinitionsTransformJson`'s JSON-Schema
 * via the `definition` "Transform".
 */
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
