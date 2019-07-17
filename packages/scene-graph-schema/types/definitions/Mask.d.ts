/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface DefinitionsMaskJson {
  [k: string]: any;
}
/**
 * This interface was referenced by `DefinitionsMaskJson`'s JSON-Schema
 * via the `definition` "Mask".
 */
export interface Mask {
  maskType: number;
  inverted: boolean;
  spriteFrame?: {
    url?: string;
    base64?: string;
    atlasUrl?: string;
    frameName?: string;
    [k: string]: any;
  };
  [k: string]: any;
}
