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
    z: number;
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
export declare namespace Component {
    const Name: Readonly<{
        GAME_OBJECT: string;
        TRANSFORM: string;
        PREFAB_INSTANCE: string;
        SKINNED_MESH_RENDERER: string;
    }>;
    interface IComponent {
        m_GameObject: File.Element.FileReference;
    }
    interface GameObject {
        m_Name: string;
        m_CorrespondingSourceObject?: File.Element.FileReference;
        m_Component?: {
            component: File.Element.FileReference;
        }[];
    }
    interface Transform extends IComponent {
        m_LocalRotation: Quaternion;
        m_LocalPosition: Vec3;
        m_LocalScale: Vec3;
    }
    interface PrefabInstance {
        m_SourcePrefab?: File.Element.FileReference;
    }
    interface SkinnedMeshRenderer extends IComponent {
        m_Mesh?: File.Element.FileReference;
        m_Materials?: File.Element.FileReference[];
    }
}
export declare namespace File {
    namespace Element {
        /**
         * Regular form of unity's file reference
         */
        interface FileReference {
            fileID: string;
            guid?: string;
            type?: number;
        }
        /**
         * property for each texture envs
         */
        interface TextureProperty {
            m_Texture: File.Element.FileReference;
            m_Scale: Vec2;
            m_Offset: Vec2;
        }
    }
    /**
     * Unity meta file
     */
    interface Meta {
        guid: string;
        [key: string]: string | number | boolean;
    }
    /**
     * mat file schema
     */
    interface Material {
        Material: {
            m_SavedProperties: {
                m_TexEnvs: {
                    [key: string]: File.Element.TextureProperty;
                }[];
            };
        };
    }
}
