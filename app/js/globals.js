/*global Http */

const tileWidth = 256,
      tileHeight = 256,
      maxTilesWhenZoomIn = 4,
      defaultZoomIncrement = 0.07,
      http = new Http();

let app = {};
