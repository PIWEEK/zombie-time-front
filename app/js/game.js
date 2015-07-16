/*global $, R, StompConnection, Interface, Sprite, Canvas, conf, game, moment */

class Game {
  constructor() {
    this.grid = {};
    this.stomp = new StompConnection();
    this.registerEventHandlers();
    this.initialized = false;
    this.interface = new Interface();
    this.lightbox = new Lightbox();
    this.currentAction = undefined;
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
    const username = utils.getQueryParams().username,
          getLeader = R.find(R.propEq("leader", true)),
          isFromPlayer = R.filter(R.propEq("player", username)),
          getPlayer = R.compose(getLeader, isFromPlayer);
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
    this.player = getPlayer(gameInfo.data.survivors);

    if (this.canvas !== undefined) {
      this.canvas.grid = this.grid;
      this.canvas.player = getPlayer(gameInfo.data.survivors);
    };
  }

  updateCatched(gameInfo) {
    let players = gameInfo.data.survivors,
        cleanText = (x) => x.innerHTML = "",
        characterList = document.querySelectorAll('#list-character li');

    R.map(cleanText, characterList);

    for (let p in players) {
      let player = players[p];
      document.querySelector(
        `#list-character .${player.slug}`).innerHTML = player.player;
    }
  }

  finalCountDown() {
    let time = 900,
        duration = moment.duration(time * 1000, 'milliseconds'),
        interval = 1000;

    setInterval(function(){
      duration = moment.duration(duration.asMilliseconds() - interval, 'milliseconds');
      $('#top-right-interface').text(moment(duration.asMilliseconds()).format('mm:ss'));
    }, interval);
  }

  clearLightboxes() {
    let clearText = (x) => x.style.display = "none",
        lbList = document.querySelectorAll('.inner-lb');

    R.map(clearText, lbList);
    document.querySelector('.lightbox').style.display = "none";
  }

  showLightbox(el) {
    document.querySelector('.lightbox').style.display = "block";
    document.querySelector(`#${el}`).style.display = "block";
  }

  sendAttackMessage(point) {
    this.stomp.sendMessage("ATTACK", { point: point.toString() });
  }

  sendMoveMessage(point) {
    this.stomp.sendMessage("MOVE", { point: point.toString() });
  }

  sendSearchMessage() {
    this.stomp.sendMessage("SEARCH", {});
  }

  sendSearchMoreMessage(token) {
    this.stomp.sendMessage("SEARCH_MORE", { token: token });
  }

  sendNoiseMessage() {
    this.stomp.sendMessage("NOISE", {});
  }

  sendEndTurnMessage() {
    this.stomp.sendMessage("END_TURN", {});
  }

  registerEventHandlers() {
    let w = $(window),
        onMessage = (e, message) => {
          if (message.type === "FULL_GAME") {
            this.initialized ? this.parseGameInfo(message) : this.initialize(message);
            this.updateCatched(message);
          } else if (message.type === "START_GAME") {
            $('#choose-character').hide();
            this.interface.show();
            this.finalCountDown();
          } else if (message.type === "ANIMATION_ATTACK") {
            this.lightbox.hideAll();
            this.lightbox.show('#animation-attack');
          } else if (message.type === "FIND_ITEM") {
            this.lightbox.hideAll();
            this.lightbox.show('#find-item');
          } else if (message.type === "ZOMBIE_TIME") {
            this.lightbox.hideAll();
            this.lightbox.show('#zombie-time');
          } else if (message.type === "ZOMBIE_ATTACK") {
            this.lightbox.hideAll();
            this.lightbox.show('#zombie-attack');
          } else if (message.type === "END_GAME") {
            this.lightbox.hideAll();
            this.lightbox.show('#end-game');
          }

          this.canvas.redraw();
        },
        onCellClick = (e, cell) => {
          console.log('***********************************');
          console.log(` >> CELL -- ${cell}`);
          console.log(` >> ACTION -- ${this.canvas.currentAction}`);
          console.log('***********************************');

          if (this.canvas.currentAction == "move" && R.contains(cell, this.player.canMoveTo)) {
            this.sendMoveMessage(cell);
            this.canvas.currentAction = undefined;
          } else if (this.canvas.currentAction == "attack" && R.contains(cell, this.player.canAttackTo)) {
            this.sendAttackMessage(cell);
            this.canvas.currentAction = undefined;
          }
          this.canvas.redraw();
        },
        onInterfaceButtonClick = (e, action, searchMoreToken) => {
          console.log(` > Me clickan la acción ${action}`);
          switch(action) {
          case "search":
            this.sendSearchMessage();
            this.canvas.currentAction = undefined;
            break;
          case "searchMore":
            this.sendSearchMoreMessage(searchMoreToken);
            this.canvas.currentAction = undefined;
            break;
          case "noise":
            this.sendNoiseMessage();
            this.canvas.currentAction = undefined;
            break;
          case "endTurn":
            this.sendEndTurnMessage();
            this.canvas.currentAction = undefined;
            break;
          default:
            this.canvas.currentAction = action;
          }
          this.canvas.redraw();
        };

    w.on("message.stomp.zt", onMessage);
    w.on("cellClick.canvas.zt", onCellClick);
    w.on("buttonClick.interface.zt", onInterfaceButtonClick);
  }
}
