'use strict';
var a = this;
module.exports = {
  load () {
    // execute when package loaded
  },

  unload () {
    // execute when package unloaded
  },

  // register your ipc messages here
  messages: {
    'open' () {
      // open entry panel registered in package.json
      Editor.Panel.open('hello');
    },
    'say-hello' () {
      Editor.log('Hello World!');
      // send ipc message to panel
      Editor.Ipc.sendToPanel('hello', 'hello:hello');
    },
    'clicked' () {
      ((parent, regex) => {
        for (let property in parent) {
          if (regex.test(property)) {
            Editor.log(property);
          }
        }
      })(Editor, /scene/i);
      //Editor.log(Editor.currentSceneUuid);
    }
  },
};