# Example

Install dependencies.

```
npm i
```

Run following command to convert cocos creator texture atlas plist to json.

```
SRC=www/assets/Texture/sample_sprite_sheet.plist node ../scripts/plist2json.js
```

Then launch local server

```
node ./server.js
```

Imported scene graph can be scene in following url

```
open http://localhost:8888/
```
