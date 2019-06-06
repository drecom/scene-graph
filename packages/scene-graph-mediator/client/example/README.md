# Example

Run following command to export scene graph.

### use environment(Cocos)
```  value
RUNTIME=cc2 ASSET_ROOT=CocosCreatorProject/assets/  SCENE_FILE=CocosCreatorProject/assets/Scene/sample.fire  node ../bin/cli.js
```
### use config file(Unity)
```
node ../bin/cli.js -c sgmed.config_unity.js
```
---

Scene graph schema will be generated in `scene-graph` directory.

Also related resources are copied to the same directory.

