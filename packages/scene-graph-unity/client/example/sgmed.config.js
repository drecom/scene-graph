module.exports = () => {
  return {
    runtime: 'unity',
    assetRoot: 'UnityProject/Assets',
    sceneFiles: [
      'UnityProject/Assets/Scenes/SampleScene.unity',
      'UnityProject/Assets/Scenes/MeshRendererScene.unity'

    ],
    plugins: [
      // define module name or path
    ]
  };
};
