/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface DefinitionsMeshRendererJson {
  [k: string]: any;
}
/**
 * This interface was referenced by `DefinitionsMeshRendererJson`'s JSON-Schema
 * via the `definition` "MeshRenderer".
 */
export interface MeshRenderer {
  mesh?: {
    url: string;
    [k: string]: any;
  };
  materials?: {
    url: string;
    [k: string]: any;
  }[];
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