/*global Http */

const tileWidth = 256,
      tileHeight = 256,
      spriteSizeX = 16,
      spriteSizeY = 21,
      maxTilesWhenZoomIn = 4,
      defaultZoomIncrement = 0.07,
      serverUrl = "http://localhost:3000",
      http = new Http(serverUrl);

let app = {};
