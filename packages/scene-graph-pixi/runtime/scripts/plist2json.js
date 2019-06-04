#!/usr/bin/env node

const fs    = require('fs');
const path  = require('path');
const plist = require('plist');

let src  = process.env.SRC;
let dest = process.env.DEST;

if (!src) {
  console.log(`Usage:
  SRC   source plist
  DEST  [optional] destination path

example;
  SRC=./path/to/src.plist DEST=./path/to/dest.json node plist2json.js`);
  process.exit(1);
}
if (!dest) {
  const names = src.split('.');
  names.pop();
  names.push('json');
  dest = names.join('.');
}

if (!path.isAbsolute(src)) {
  src = path.resolve(process.cwd(), src);
}

if (!path.isAbsolute(dest)) {
  dest = path.resolve(process.cwd(), dest);
}

const content = fs.readFileSync(src);
const json = plist.parse(content.toString());

const pixijson = {
  frames: {},
  meta: {
    format: json.metadata.format,
    realTextureFileName: json.metadata.realTextureFileName,
    size: json.metadata.size,
    smartupdate: json.metadata.smartupdate,
    textureFileName: json.metadata.textureFileName,
    image: json.metadata.realTextureFileName
  }
}



const frameKeys = Object.keys(json.frames);
for (let i = 0; i < frameKeys.length; i++) {
  const key = frameKeys[i];
  const frame = json.frames[key];
  if (false) {
    // cocos2d-x version
    let match;
    match = /{{([0-9]+),([0-9]+)},{([0-9]+),([0-9]+)}}/.exec(frame.frame);
    if (!match) {
      continue;
    }

    const x = match[1];
    const y = match[2];
    const w = match[3];
    const h = match[4];

    let srcW = w;
    let srcH = h;

    match = /{([0-9]+),([0-9]+)}/.exec(frame.sourceSize);
    if (!match) {
      continue;
    }

    const realW = match[1];
    const realH = match[2];

    let offsetX = 0;
    let offsetY = 0;

    match = /{([0-9]+),([0-9]+)}/.exec(frame.offset);
    if (match) {
      offsetX = match[1];
      offsetY = match[2];
    }

    let srcOffsetX = 0;
    let srcOffsetY = 0;

    match = /{{([0-9]+),([0-9]+)},{([0-9]+),([0-9]+)}}/.exec(frame.sourceColorRect);
    if (match) {
      srcOffsetX = match[1];
      srcOffsetY = match[2];
      srcW = match[3];
      srcH = match[4];
    }


    pixijson.frames[key] = {
      frame: {x, y, w, h},
      rotated: frame.rotated,
      sourceSize: {
        w: realW,
        h: realH
      },
      spriteSourceSize: {
        x: srcOffsetX,
        y: srcOffsetY,
        w: srcW,
        h: srcH
      },
      trimmed: (offsetX !== 0 || offsetY !== 0)
    };
  } else {
    // cocos creator version
    let match;
    match = /{([0-9]+),([0-9]+)}/.exec(frame.spriteSize);
    if (!match) {
      continue;
    }

    const w = match[1];
    const h = match[2];

    match = /{([\-0-9]+),([\-0-9]+)}/.exec(frame.spriteSourceSize);
    if (!match) {
      continue;
    }

    const realW = match[1];
    const realH = match[2];

    let srcX = 0;
    let srcY = 0;

    match = /{([\-0-9]+),([\-0-9]+)}/.exec(frame.spriteOffset);
    if (match) {
      srcX = match[1];
      srcY = match[2];
    }

    let x = 0;
    let y = 0;

    match = /{{([\-0-9]+),([\-0-9]+)},{([\-0-9]+),([\-0-9]+)}}/.exec(frame.textureRect);
    if (match) {
      x = match[1];
      y = match[2];
      srcW = match[3];
      srcH = match[4];
    }

    pixijson.frames[key] = {
      frame: {x, y, w, h},
      rotated: frame.textureRotated,
      sourceSize: {
        w: realW,
        h: realH
      },
      spriteSourceSize: {
        x: srcX,
        y: srcY,
        w: srcW,
        h: srcH
      },
      trimmed: (x !== 0 || y !== 0)
    };
  }
}

fs.writeFileSync(dest, JSON.stringify(pixijson));
