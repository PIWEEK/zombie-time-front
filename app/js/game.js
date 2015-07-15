/*global $, R, StompConnection, Sprite, Canvas, conf */

class Game {
  constructor() {
    this.grid = {};
    this.stomp = new StompConnection();
    this.registerEventHandlers();
    this.initialized = false;
  }

  initialize(gameInfo) {
    this.initialized = true;
    this.parseGameInfo(gameInfo);
    this.canvas = new Canvas();
    this.canvas.map = this.map;
    this.canvas.grid = this.grid;
    this.canvas.resize();
  }

  parseGameInfo(gameInfo) {
    let processSimpleLayer = (layer, val, idx, list) => {
      let shiftedVal = val - 1;

      if (this.grid[idx] == undefined) {
        this.grid[idx] = {};
      }
      this.grid[idx][layer] = shiftedVal;
    };
    let processSimpleLayerCurried = R.curry(processSimpleLayer),
        processFloor = processSimpleLayerCurried("floor", R.__, R.__, R.__),
        processWall = processSimpleLayerCurried("wall", R.__, R.__, R.__),
        processItem = processSimpleLayerCurried("item", R.__, R.__, R.__);

    let processComplexLayer = (layer, val, idx, list) => {
      let position = val.point,
          getShiftedVal = (val) => {
            val.avatar -= 1;
            return val;
          },
          shiftedVal = getShiftedVal(val);

      if (position !== -1) {
        if (this.grid[position][layer]) {
          this.grid[position][layer].push(shiftedVal);
        } else {
          this.grid[position][layer] = [shiftedVal];
        }
      }
    };
    let processComplexLayerCurried = R.curry(processComplexLayer),
        processSurvivors = processComplexLayerCurried("survivors", R.__, R.__, R.__),
        processZombies = processComplexLayerCurried("zombies", R.__, R.__, R.__);

    this.grid = {};
    this.interval = gameInfo.zombieTimeInterval;
    this.map = {
      sizeX: gameInfo.data.map.width,
      sizeY: gameInfo.data.map.height
    };
    this.victoryConditions = gameInfo.victoryConditions;

    R.forEachIndexed(processFloor, gameInfo.data.map.floorTiles);
    R.forEachIndexed(processWall, gameInfo.data.map.wallTiles);
    R.forEachIndexed(processItem, gameInfo.data.map.itemTiles);
    R.forEachIndexed(processSurvivors, gameInfo.data.survivors);
    R.forEachIndexed(processZombies, gameInfo.data.zombies);

    if (this.canvas !== undefined) this.canvas.grid = this.grid;
  }

  registerEventHandlers() {
    let w = $(window),
        onMessage = (e, message) => {
          if (message.type === "FULL_GAME") {
            this.initialized ? this.parseGameInfo(message) : this.initialize(message);
          } else if (message.type === "START_GAME") {
            $('#choose-character').hide();
          }

          this.canvas.redraw();
        };

    w.on("message.stomp.zt", onMessage);
  }
}
