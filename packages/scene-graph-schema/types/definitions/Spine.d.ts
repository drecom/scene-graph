/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface DefinitionsSpineJson {
  [k: string]: any;
}
/**
 * This interface was referenced by `DefinitionsSpineJson`'s JSON-Schema
 * via the `definition` "Spine".
 */
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
