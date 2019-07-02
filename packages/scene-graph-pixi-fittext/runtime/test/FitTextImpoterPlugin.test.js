import assert from "power-assert";
import "pixi.js";
import { FitText } from "@drecom/pixi-fittext";
import { FitTextImporterPlugin } from "../src/FitTextImporterPlugin";

const textNode = {
  id: "5",
  name: "New Label",
  constructorName: "cc.Node",
  transform: {
    width: 97.87,
    height: 50.4,
    x: 0,
    y: 99.155,
    rotation: 0,
    scale: {
      x: 1,
      y: 1
    },
    anchor: {
      x: 0.5,
      y: 0.5
    },
    parent: "2",
    children: []
  },
  renderer: {
    color: {
      r: 255,
      g: 255,
      b: 255,
      a: 255
    }
  },
  text: {
    text: "Label",
    style: {
      size: 40,
      horizontalAlign: 1,
      color: "#ffffff"
    }
  }
};

const scaledNode = {
  id: "7",
  name: "New Node",
  constructorName: "cc.Node",
  transform: {
    width: 400,
    height: 50.4,
    x: 20.362,
    y: -18.412,
    scale: {
      x: 0.5,
      y: 1
    },
    anchor: {
      x: 0.5,
      y: 0.5
    },
    parent: "2",
    children: []
  },
  renderer: {
    color: {
      r: 255,
      g: 255,
      b: 255,
      a: 255
    }
  },
  text: {
    text: "あいうえお",
    fitText: {
      requiredWidth: 200,
    },
    style: {
      size: 40,
      horizontalAlign: 0,
      color: "#ffffff"
    },
  }
};


describe("FitTextImporterPlugin", () => {
  describe("extendRuntimeObjects", () => {
    it("should be implement extendRuntimeObjects() method", () => {
      assert.notEqual(new FitTextImporterPlugin().extendRuntimeObjects, null);
    });
  });

  describe("createRuntimeObject", () => {
    it("should be implement createRuntimeObject() method", () => {
      assert.notEqual(new FitTextImporterPlugin().createRuntimeObject, null);
    });

    it("should be returns null for not FitText node.", () => {
      const plugin = new FitTextImporterPlugin();
      assert.deepEqual(plugin.createRuntimeObject(textNode), null);
    });

    it("should be returns FitText instance for FitText node.", () => {
      const plugin = new FitTextImporterPlugin();
      assert.ok(plugin.createRuntimeObject(scaledNode) instanceof FitText);
    });
  });
});
