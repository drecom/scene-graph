/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface DefinitionsSpriteJson {
  [k: string]: any;
}
/**
 * This interface was referenced by `DefinitionsSpriteJson`'s JSON-Schema
 * via the `definition` "Sprite".
 */
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
