import UnityAssetFile from '../asset/UnityAssetFile';

export interface SgmedAssetInfo {
  ref: File.Element.FileReference;
  file: UnityAssetFile;
}

/**
 * Each document in unity scene
 * data is raw data
 */
export interface SceneEntity {
  prefab: boolean;
  componentName: string;
  data: {
    [key: string]: any;
  };
  sgmed?: {
    assets?: {
      [key: string]: SgmedAssetInfo[];
    };
  };
}

/**
 * Union of SceneEntity
 * Anchor is used for key
 */
export interface Scene {
  [anchor: string]: SceneEntity;
}
export interface Vec2 {
  x: number;
  y: number;
}
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}
export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

/**
 * schema for unity components
 */
export namespace Component {
  export const Name = Object.freeze({
    GAME_OBJECT: 'GameObject',
    TRANSFORM: 'Transform',
    PREFAB_INSTANCE: 'PrefabInstance',
    SKINNED_MESH_RENDERER: 'SkinnedMeshRenderer'
  });

  export interface IComponent {
    m_GameObject: File.Element.FileReference;
  }
  export interface GameObject {
    m_Name: string;
    m_CorrespondingSourceObject?: File.Element.FileReference;
    m_Component?: {
      component: File.Element.FileReference;
    }[];
  }
  export interface Transform extends IComponent {
    m_LocalRotation: Quaternion;
    m_LocalPosition: Vec3;
    m_LocalScale: Vec3;
  }

  export interface PrefabInstance {
    m_SourcePrefab?: File.Element.FileReference;
  }
  export interface SkinnedMeshRenderer extends IComponent {
    m_Mesh?: File.Element.FileReference;
    m_Materials?: File.Element.FileReference[];
  }
}

export namespace File {
  export namespace Element {
    /**
     * Regular form of unity's file reference
     */
    export interface FileReference {
      fileID: string;
      guid?: string;
      type?: number;
    }

    /**
     * property for each texture envs
     */
    export interface TextureProperty {
      m_Texture: File.Element.FileReference;
      m_Scale: Vec2;
      m_Offset: Vec2;
    }
  }
  /**
   * Unity meta file
   */
  export interface Meta {
    guid: string;
    [key: string]: string | number | boolean;
  }

  /**
   * mat file schema
   */
  export interface Material {
    Material: {
      m_SavedProperties: {
        m_TexEnvs: {
          [key: string]: File.Element.TextureProperty
        }[];
      }
    };
  }
}
