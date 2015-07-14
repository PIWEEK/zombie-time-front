/*global Http */

const conf = {
  tileWidth: 256,
  tileHeight: 256,
  spriteSizeX: 16,
  spriteSizeY: 21,
  maxTilesWhenZoomIn: 4,
  defaultZoomIncrement: 0.07,
  serverUrl: "http://localhost:3000"
};

const http = new Http(conf.serverUrl);
