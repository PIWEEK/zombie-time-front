/*global Sprite, Canvas, conf */

class Game {
  constructor() {
    this.grid = {};
  }

  parseGameInfo(gameInfo) {
    let processSimpleLayer = (layer, val, idx, list) => {
      if (this.grid[idx] == undefined) {
        this.grid[idx] = {};
      }
      this.grid[idx][layer] = val;
    };
    let processSimpleLayerCurried = R.curry(processSimpleLayer),
        processFloor = processSimpleLayerCurried("floor", R.__, R.__, R.__),
        processWall = processSimpleLayerCurried("wall", R.__, R.__, R.__),
        processItem = processSimpleLayerCurried("item", R.__, R.__, R.__);

    let processComplexLayer = (layer, val, idx, list) => {
      let position = val.point;
      console.log('--------------------------');
      console.log(val);
      console.log(this.grid[position]);
      console.log('--------------------------');

      this.grid[position][layer] = this.grid[position][layer] ? this.grid[position][layer].push(val) : [val];
    };
    let processComplexLayerCurried = R.curry(processComplexLayer),
        processSurvivors = processComplexLayerCurried("survivors", R.__, R.__, R.__),
        processZombies = processComplexLayerCurried("zombies", R.__, R.__, R.__);

    gameInfo = fakeGameInfo; // TO BE DELETED
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

    console.log(this.grid);
  }
}
