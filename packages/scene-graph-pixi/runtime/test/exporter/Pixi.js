import assert from 'power-assert';
import { spy } from 'sinon';
import 'pixi.js';
import Exporter from 'exporter/Pixi';

describe('Exporter', () => {
  const pixi = new Exporter();

  describe('createSchema', () => {
    it ('should call createNodeRecursive internally', () => {
      const pisiSpy = spy(pixi, 'createNodeRecursive');
      pixi.createSchema(new PIXI.Container());
      assert.ok(pisiSpy.calledOnce);
    });
  });
  describe('createNode', () => {
    describe('when plain Conatiner is passed', () => {
      let subject;
      let baseContainer;

      before(() => {
        const parentContainer = new PIXI.Container();
        const childContainer  = new PIXI.Container();
        parentContainer.name = 'parent';
        childContainer.name  = 'child';

        baseContainer = new PIXI.Container();
        baseContainer.position.x = 10;
        baseContainer.position.y = 10;
        baseContainer.name = 'testName';
        baseContainer.parent = parentContainer;
        baseContainer.addChild(childContainer);

        parentContainer.addChild(baseContainer);

        subject = pixi.createNode(baseContainer);
      });

      it ('should assign constructor.name as Node.constructorName', () => {
        assert.strictEqual(subject.constructorName, baseContainer.constructor.name);
      });
      it ('should assign name as Node.id', () => {
        assert.strictEqual(subject.id, baseContainer.name);
      });
      it ('should assign name as Node.name', () => {
        assert.strictEqual(subject.name, baseContainer.name);
      });
      it ('should assign position.x as Node.transform.x', () => {
        assert.strictEqual(subject.transform.x, baseContainer.position.x);
      });
      it ('should assign position.y as Node.transform.y', () => {
        assert.strictEqual(subject.transform.y, baseContainer.position.y);
      });
      it ('should assign parent.name as Node.transform.parent', () => {
        assert.strictEqual(subject.transform.parent, baseContainer.parent.name);
      });
      it ('should assign children[].name as Node.transform.children[]', () => {
        assert.strictEqual(subject.transform.children.length, baseContainer.children.length);
        assert.strictEqual(subject.transform.children[0], baseContainer.children[0].name);
      });
    });

    describe('when Sprite is passed', () => {
      let subject;
      let sprite;

      before(() => {
        sprite = new PIXI.Sprite();
        sprite.name = 'testName';
        subject = pixi.createNode(sprite);
      });

      it ('should assign object with url property to Node.sprite', () => {
        assert.ok(subject.sprite.hasOwnProperty('url'));
      });
    });

    describe('when Text is passed', () => {
      let subject;
      let text;

      before(() => {
        text = new PIXI.Text('testText', new PIXI.TextStyle({ fontSize: 99, fill: '#123456' }));
        text.name = 'testName';
        subject = pixi.createNode(text);
      });

      it ('should assign text as Node.text.text', () => {
        assert.ok(subject.text.text, text.text);
      });
      it ('should assign style.fontSize property to Node.text.style.size', () => {
        assert.ok(subject.text.style.size, text.style.fontSize);
      });
      it ('should assign style.fill property to Node.text.style.color', () => {
        assert.ok(subject.text.style.color, text.style.fill);
      });
    });
  });
});
