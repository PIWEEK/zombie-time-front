/*global Sprite, Canvas, conf */

let fakeGameInfo = {
  "game": "06bab3c1-ae6c-45f3-8acf-7f88a9a8fee3",
  "user": "",
  "type": "FULL_GAME",
  "data": {
    "survivors": [
      {
        "id": "2f4fab83-a78b-48da-b6ac-7cbfc322e3ee",
        "player": "a",
        "slug": "yami",
        "avatar": 310,
        "leader": false,
        "remainingLife": 1,
        "remainingActions": 1,
        "remainingInventory": 1,
        "remainingDefense": 1,
        "point": 0
      }
    ],
    "zombies": [
      {
        "id": "4543768b-6b03-4ff5-a3f1-1d0da262f86f",
        "remainingLife": 1,
        "remainingDamage": 1,
        "point": 0,
        "avatar": 337
      },
      {
        "id": "5160d177-4942-442d-998c-6c94c035f4b4",
        "remainingLife": 1,
        "remainingDamage": 1,
        "point": 9,
        "avatar": 337
      },
      {
        "id": "ff14824b-cc1d-44c7-8fc1-0d53a46648a2",
        "remainingLife": 1,
        "remainingDamage": 1,
        "point": 18,
        "avatar": 337
      },
      {
        "id": "b7779722-a14d-436b-97ae-6c4c3808219c",
        "remainingLife": 1,
        "remainingDamage": 1,
        "point": 27,
        "avatar": 337
      },
      {
        "id": "9499bb64-f414-4e5a-bd75-8bcfb93df2e1",
        "remainingLife": 1,
        "remainingDamage": 1,
        "point": 36,
        "avatar": 337
      },
      {
        "id": "021d9b9e-f175-4652-8d51-faa86250c35d",
        "remainingLife": 1,
        "remainingDamage": 1,
        "point": 4,
        "avatar": 337
      },
      {
        "id": "af0896f3-be11-4a9a-88a5-65a8870fc58f",
        "remainingLife": 1,
        "remainingDamage": 1,
        "point": 4,
        "avatar": 337
      },
      {
        "id": "02e6ae55-c0ab-4ee8-b73d-450dad450150",
        "remainingLife": 1,
        "remainingDamage": 1,
        "point": 22,
        "avatar": 337
      },
      {
        "id": "6f1527b0-fffa-42c4-9a99-7a73b144e308",
        "remainingLife": 1,
        "remainingDamage": 1,
        "point": 31,
        "avatar": 337
      },
      {
        "id": "97ce806a-8f4c-425d-93be-ec37ba1b1077",
        "remainingLife": 1,
        "remainingDamage": 1,
        "point": 25,
        "avatar": 337
      },
      {
        "id": "336c140d-0b8d-40dd-97a8-cbff608e6d84",
        "remainingLife": 1,
        "remainingDamage": 1,
        "point": 35,
        "avatar": 337
      },
      {
        "id": "dbf0177a-cd83-4999-990d-a685614d5674",
        "remainingLife": 1,
        "remainingDamage": 1,
        "point": 6,
        "avatar": 337
      }
    ],
    "time": 900,
    "zombieTimeInterval": 60,
    "map": {
      "width": 9,
      "height": 5,
      "floorTiles": [
        56,
        68,
        1,
        195,
        114,
        132,
        56,
        53,
        51,
        34,
        2,
        10,
        3,
        3,
        4,
        54,
        56,
        52,
        55,
        68,
        8,
        179,
        66,
        8,
        54,
        65,
        131,
        114,
        132,
        8,
        193,
        194,
        8,
        55,
        35,
        122,
        113,
        1,
        7,
        3,
        3,
        12,
        3,
        3,
        3
      ],
      "wallTiles": [
        292,
        0,
        0,
        0,
        296,
        0,
        292,
        0,
        0,
        293,
        0,
        0,
        0,
        0,
        0,
        0,
        289,
        0,
        290,
        0,
        0,
        295,
        293,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        293,
        0,
        289,
        296,
        291,
        293,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ],
      "itemTiles": [
        259,
        234,
        0,
        273,
        218,
        242,
        226,
        250,
        240,
        266,
        281,
        0,
        0,
        0,
        0,
        263,
        259,
        229,
        227,
        213,
        0,
        225,
        259,
        0,
        0,
        212,
        241,
        242,
        245,
        0,
        221,
        278,
        0,
        263,
        0,
        247,
        238,
        0,
        0,
        0,
        0,
        281,
        0,
        280,
        0
      ]
    },
    "victoryConditions": [
      {
        "numPlayers": 4,
        "point": 43,
        "objects": [
          "gas",
          "gas",
          "gas",
          "gas"
        ]
      }
    ]
  },
  "timeStamp": 1436951431521
};

class Game {
  constructor() {
    this.grid = {};
  }

  initialize(gameInfo) {
    this.parseGameInfo(gameInfo);
    this.canvas = new Canvas();
    this.canvas.map = this.map;
    this.canvas.grid = this.grid;
    this.canvas.resize();
  }

  parseGameInfo(gameInfo) {
    let processSimpleLayer = (layer, val, idx, list) => {
      if (this.grid[idx] == undefined) {
        this.grid[idx] = {};
      }
      this.grid[idx][layer] = val - 1;
    };
    let processSimpleLayerCurried = R.curry(processSimpleLayer),
        processFloor = processSimpleLayerCurried("floor", R.__, R.__, R.__),
        processWall = processSimpleLayerCurried("wall", R.__, R.__, R.__),
        processItem = processSimpleLayerCurried("item", R.__, R.__, R.__);

    let processComplexLayer = (layer, val, idx, list) => {
      let position = val.point;

      // TRANSFORMAR VAL  -1 avatar

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

    if (this.canvas !== undefined) this.canvas.grid = this.grid;
  }
}
