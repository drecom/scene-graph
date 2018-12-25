module.exports = () => {
  return {
    runtime: 'cc2',
    assetRoot: 'CocosCreatorProject/assets',
    sceneFiles: [
      'CocosCreatorProject/assets/Scene/sample.fire'
    ],
    plugins: [
      // define module name or path
      '/Users/kuwabara_yuki/workspace/git/scene-graph/packages/scene-graph-event/client/lib/exporter/CocosCreator',
      '/Users/kuwabara_yuki/workspace/git/scene-graph/packages/scene-graph-cocos-animation/client/'
    ]
  };
};
