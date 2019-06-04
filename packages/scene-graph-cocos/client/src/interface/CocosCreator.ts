/**
 * Cocos Creator scene file and meta file dto interface
 */

export const MetaTypes: { [keys: string]: string } = Object.freeze({
  SCENE:  'cc.Scene',
  CANVAS: 'cc.Canvas',
  NODE:   'cc.Node',
  SPRITE: 'cc.Sprite',
  LABEL:  'cc.Label',
  LAYOUT: 'cc.Layout'
});

// TODO: expose or float this definition, scene-graph-mediator-rt importer may refer this
export const SpriteType = Object.freeze({
  SIMPLE: 0,
  SLICED: 1,
  TILED:  2,
  FILLED: 3,
  MESH:   4
});

/**
 * Common meta file interface
 */
export interface MetaBase {
  uuid: string;
  subMetas: {
    [key: string]: MetaBase
  };
}

/**
 * Sprite meta interface
 */
export interface MetaSprite extends MetaBase {
  ver: string;
  rawTextureUuid: string;
  trimType: string;
  trimThreshold: number;
  rotated: boolean;
  offsetX: number;
  offsetY: number;
  trimX: number;
  trimY: number;
  width: number;
  height: number;
  rawWidth: number;
  rawHeight: number;
  borderTop: number;
  borderBottom: number;
  borderLeft: number;
  borderRight: number;
  spriteType: string;
}

/**
 * Base of scene component
 */
export interface ComponentBase {
  __type__: string;
}

/**
 * Common uuid referer
 */
export interface ComponentUuidEntity {
  __uuid__: string;
}

/**
 * Common Node interface in scene
 */
export interface ComponentNodeIdEntity {
  __id__: number;
}

export interface Size extends ComponentBase {
  width: number;
  height: number;
}

export interface Vec2 extends ComponentBase {
  x: number;
  y: number;
}

export interface Vec3 extends ComponentBase {
  x: number;
  y: number;
  z: number;
}

export interface Color extends ComponentBase {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * Common component interface that related to Node entity
 */
export interface Component extends ComponentBase {
  node: ComponentNodeIdEntity;
}

export interface Node extends ComponentBase {
  _name: string;
  _parent: ComponentNodeIdEntity | null;
  _children: ComponentNodeIdEntity[];
  _contentSize: Size;
  _rotationX: number;
  _rotationY: number;
  _scaleX: number;
  _scaleY: number;
  _position: Vec2;
  _opacity: number;
  _color: Color;
  _anchorPoint: Vec2;
}

export interface NodeV2 extends ComponentBase {
  _name: string;
  _parent: ComponentNodeIdEntity | null;
  _children: ComponentNodeIdEntity[];
  _contentSize: Size;
  _rotationX: number;
  _rotationY: number;
  _scale: Vec3;
  _position: Vec2;
  _opacity: number;
  _color: Color;
  _anchorPoint: Vec2;
}

export interface Canvas extends Component {
  _designResolution: Size;
}

export interface Sprite extends Component {
  _spriteFrame: ComponentUuidEntity;
  _atlas: ComponentUuidEntity | null;
  _type: number;
}

export interface Label extends Component {
  _fontSize: number;
  _N$string: string;
  _N$fontFamily: string;
  _N$horizontalAlign: number;
}

export interface Layout extends Component {
  _layoutSize: Size;
  _resize:number;
  _N$layoutType: number;
  _N$cellSize: Size;
  _N$startAxis: number;
  _N$paddingLeft: number;
  _N$paddingRight: number;
  _N$paddingTop: number;
  _N$paddingBottom: number;
  _N$spacingX: number;
  _N$spacingY: number;
  _N$verticalDirection: number;
  _N$horizontalDirection: number;
}
