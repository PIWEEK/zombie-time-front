/*global Http */

const conf = {
  tileWidth: 256,
  tileHeight: 256,
  spriteSizeX: 16,
  spriteSizeY: 22,
  maxTilesWhenZoomIn: 4,
  defaultZoomIncrement: 0.07,
  clickPixelDelta: 5,
  serverUrl: "http://10.8.1.129:3000",
  websocketsUrl: "http://10.8.1.129:8080"
};

const http = new Http(conf.serverUrl);
