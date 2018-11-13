import assert from 'power-assert';
import { spy } from 'sinon';
import 'pixi.js';
import { Pixi } from 'property_converter/Pixi';

const sceneFixture = {
  scene: [],
  metadata: {
    width: 0,
    height: 0,
    positiveCoord: {
      xRight: true,
      yDown:true
    }
  }
};
const transformFixture = {
  x: 1,
  y: 2,
  rotation: 3,
  scale: {
    x: 4,
    y: 5
  },
  anchor: {
    x: 6,
    y: 7
  }
};

describe('Pixi', () => {
  describe('createConvertedObject', () => {
    const subject = Pixi.createConvertedObject(sceneFixture, transformFixture);

    it ('should return object contains position', () => {
      assert.ok(subject.position !== undefined);
      assert.ok(subject.position.x !== undefined);
      assert.ok(subject.position.y !== undefined);
    });
    it ('should return object contains scale', () => {
      assert.ok(subject.scale !== undefined);
      assert.ok(subject.scale.x === transformFixture.scale.x);
      assert.ok(subject.scale.y === transformFixture.scale.y);
    });
    it ('should return object contains anchor', () => {
      assert.ok(subject.scale !== undefined);
      assert.ok(subject.anchor.x !== undefined);
      assert.ok(subject.anchor.y !== undefined);
    });
    it ('should return object contains rotation', () => {
      assert.ok(subject.rotation !== undefined);
    });
    it ('should returned object\'s rotation is described in radian', () => {
      assert.ok(subject.rotation !== transformFixture.rotation);
    });

    describe('when metadata.positiveCoord.xRight of SchemaJson object is true', () => {
      sceneFixture.metadata.positiveCoord.xRight = true;
      let topicSubject = Pixi.createConvertedObject(sceneFixture, transformFixture);

      it ('should returns object which position x is not inverted', () => {
        assert.strictEqual(topicSubject.position.x, transformFixture.x);
      });
      it ('should returns object which anchor x is not modified', () => {
        assert.strictEqual(topicSubject.anchor.x, transformFixture.anchor.x);
      });
    });
    describe('when metadata.positiveCoord.xRight of SchemaJson object is false', () => {
      sceneFixture.metadata.positiveCoord.xRight = false;
      let topicSubject = Pixi.createConvertedObject(sceneFixture, transformFixture);

      it ('should returns object which position x is inverted', () => {
        assert.strictEqual(topicSubject.position.x, -transformFixture.x);
      });
      it ('should returns object which anchor x is modified', () => {
        assert.notStrictEqual(topicSubject.anchor.x, transformFixture.anchor.x);
      });
    });

    describe('when metadata.positiveCoord.yDown of SchemaJson object is true', () => {
      sceneFixture.metadata.positiveCoord.yDown = true;
      let topicSubject = Pixi.createConvertedObject(sceneFixture, transformFixture);

      it ('should returns object which position y is not inverted', () => {
        assert.strictEqual(topicSubject.position.y, transformFixture.y);
      });
      it ('should returns object which anchor y is not modified', () => {
        assert.strictEqual(subject.anchor.y, transformFixture.anchor.y);
      });
    });
    describe('when metadata.positiveCoord.yDown of SchemaJson object is false', () => {
      sceneFixture.metadata.positiveCoord.yDown = false;
      let topicSubject = Pixi.createConvertedObject(sceneFixture, transformFixture);

      it ('should returns object which position y is inverted', () => {
        assert.strictEqual(topicSubject.position.y, -transformFixture.y);
      });
      it ('should returns object which anchor y is modified', () => {
        assert.notStrictEqual(topicSubject.anchor.y, transformFixture.anchor.y);
      });
    });

    describe('when passed transform does not have scale', () => {
      const noScaleTransformFixture = Object.assign({}, transformFixture);
      delete noScaleTransformFixture.scale;

      const topicSubject = Pixi.createConvertedObject(sceneFixture, noScaleTransformFixture);

      it ('should returns object which scale x is 1', () => {
        assert.strictEqual(topicSubject.scale.x, 1);
      });
      it ('should returns object which scale y is 1', () => {
        assert.strictEqual(topicSubject.scale.y, 1);
      });
    });
    describe('when passed transform does not have rotation', () => {
      const noRotationTransformFixture = Object.assign({}, transformFixture);
      delete noRotationTransformFixture.rotation;

      const topicSubject = Pixi.createConvertedObject(sceneFixture, noRotationTransformFixture);

      it ('should returns object which rotation is 0', () => {
        assert.strictEqual(topicSubject.rotation, 0);
      });
    });
  });
  describe('fixCoordinate', () => {
    const baseX = 100;
    const baseY = 100;
    const subjectBase = {
      position: {
        x: baseX,
        y: baseY
      },
      scale: {
        x: 1.0,
        y: 1.0
      }
    };
    const node = {
      transform: {
        width:  100,
        height: 100,
        scale: {
          x: 1.0,
          y: 1.0
        },
        anchor: {
          x: 0.5,
          y: 0.5
        }
      }
    };


    describe('when first argument has anchor', () => {
      const target = {
        width: 100,
        height: 100,
        anchor: {
          x: 0.5,
          y: 0.5
        }
      };

      it ('should modify position of second argument', () => {
        subjectBase.position.x = baseX;
        subjectBase.position.y = baseY;
        const subject = Object.assign({}, subjectBase);

        Pixi.fixCoordinate(target, subject, node);

        assert.notStrictEqual(subject.position.x, baseX);
        assert.notStrictEqual(subject.position.y, baseY);
      });
    });

    describe('when 4th argument with transform.width/height was given', () => {
      const parentNode = {
        transform: {
          width: 200,
          height: 200,
          scale: {
            x: 1.0,
            y: 1.0
          },
          anchor: {
            x: 0.5,
            y: 0.5
          }
        }
      };

      it ('should modify position of second argument', () => {
        subjectBase.position.x = baseX;
        subjectBase.position.y = baseY;
        const subject = Object.assign({}, subjectBase);

        Pixi.fixCoordinate({}, subject, node, parentNode);

        assert.notStrictEqual(subject.position.x, baseX);
        assert.notStrictEqual(subject.position.y, baseY);
      });
    });

    describe('when 4th argument was not given', () => {
      it ('should not modify position of second argument', () => {
        subjectBase.position.x = baseX;
        subjectBase.position.y = baseY;
        const subject = Object.assign({}, subjectBase);

        Pixi.fixCoordinate({}, subject, node);

        assert.strictEqual(subject.position.x, baseX);
        assert.strictEqual(subject.position.y, baseY);
      });
    });
  });
  describe('applyConvertedObject', () => {
    const subjectBase = {
      position: {
        x: 100,
        y: 100
      },
      anchor: {
        x: 0.5,
        y: 0.5
      },
      scale: {
        x: 1,
        y: 1
      },
      rotation: 0
    };
    const convertedObject = {
      position: {
        x: 200,
        y: 200
      },
      anchor: {
        x: 0.6,
        y: 0.6
      },
      scale: {
        x: 2,
        y: 2
      },
      rotation: 10
    };

    it ('should overide target with position value of second argument', () => {
      const subject = Object.assign({}, subjectBase);
      subject.position.x = convertedObject.position.x + 1;
      subject.position.y = convertedObject.position.y + 1;

      Pixi.applyConvertedObject(subject, convertedObject);

      assert.strictEqual(subject.position.x, convertedObject.position.x);
      assert.strictEqual(subject.position.y, convertedObject.position.y);
    });

    it ('should overide target with scale value of second argument', () => {
      const subject = Object.assign({}, subjectBase);
      subject.scale.x = convertedObject.scale.x + 1;
      subject.scale.y = convertedObject.scale.y + 1;

      Pixi.applyConvertedObject(subject, convertedObject);

      assert.strictEqual(subject.scale.x, convertedObject.scale.x);
      assert.strictEqual(subject.scale.y, convertedObject.scale.y);
    });

    it ('should overide target with rotation value of second argument', () => {
      const subject = Object.assign({}, subjectBase);
      subject.rotation = convertedObject.rotation + 1;

      assert.notStrictEqual(subject.rotation, convertedObject.rotation);

      Pixi.applyConvertedObject(subject, convertedObject);

      assert.strictEqual(subject.rotation, convertedObject.rotation);
    });

    describe('when first argument has anchor property', () => {
      it ('should overide target with anchor value of second argument', () => {
        const subject = Object.assign({}, subjectBase)
        subject.anchor = {
          x: 0.5,
          y: 0.5
        };

        assert.notStrictEqual(subject.anchor.x, convertedObject.anchor.x);
        assert.notStrictEqual(subject.anchor.y, convertedObject.anchor.y);

        Pixi.applyConvertedObject(subject, convertedObject);

        assert.strictEqual(subject.anchor.x, convertedObject.anchor.x);
        assert.strictEqual(subject.anchor.y, convertedObject.anchor.y);
      });
    });

    describe('when first argument has no anchor property', () => {
      it ('should not add anchor value to target', () => {
        const subject = Object.assign({}, subjectBase)
        delete subject.anchor;

        Pixi.applyConvertedObject(subject, convertedObject);

        assert.strictEqual(subject.anchor, undefined);
      });
    });
  });
});
