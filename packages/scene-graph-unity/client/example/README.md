# Example

Run following command to export scene graph.

```
RUNTIME=unity ASSET_ROOT=UnityProject/Assets/  SCENE_FILE=UnityProject/Assets/Scenes/SampleScene.unity  node ../bin/cli.js
```

Scene graph schema will be generated in `scene-graph` directory.

Also related resources are copied to the same directory.


# Notice

Currently only supports separated meshes and materials from fbx.
Please download open source fbx file from following site.
https://projectlayered.com/opensource/model3D.php
