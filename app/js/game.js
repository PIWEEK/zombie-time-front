/*global $, R, StompConnection, Interface, Sprite, Canvas, conf, game, moment, utils */

class Game {
  constructor() {
    this.grid = {};
    this.stomp = new StompConnection();
    this.registerEventHandlers();
    this.initialized = false;
    this.interface = new Interface();
    this.lightbox = new Lightbox();
    this.currentAction = undefined;
    this.myTurn = false;
  }

  initialize(gameInfo) {
    this.initialized = true;
    this.parseGameInfo(gameInfo);
    this.canvas = new Canvas();
    this.canvas.map = this.map;
    this.canvas.grid = this.grid;
    this.canvas.resize();
  }

  getGridOccupation(data) {
    let gridOccupation = {},
        includePointsOnList = (list, points) => {
          let addToPoint = (point) => {
            if (gridOccupation[point] === undefined) {
              gridOccupation[point] = {};
            }
            gridOccupation[point][list] = gridOccupation[point][list] === undefined ? 1 : gridOccupation[point][list] + 1;
          };

          R.forEach(addToPoint, points);
        },
        survivorPoints = includePointsOnList("survivors", R.map(R.prop("point"), data.survivors)),
        zombiePoints = includePointsOnList("zombies", R.map(R.prop("point"), data.zombies));

    return gridOccupation;
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
    this.victoryConditions = gameInfo.data.victoryConditions;
    this.missions = gameInfo.data.missions;
    this.catchedSurvivors = gameInfo.data.catchedSurvivors;

    R.forEachIndexed(processFloor, gameInfo.data.map.floorTiles);
    R.forEachIndexed(processWall, gameInfo.data.map.wallTiles);
    R.forEachIndexed(processItem, gameInfo.data.map.itemTiles);
    R.forEachIndexed(processSurvivors, gameInfo.data.survivors);
    R.forEachIndexed(processZombies, gameInfo.data.zombies);
    this.player = getPlayer(gameInfo.data.survivors);
    if (this.player) {
      this.myTurn = gameInfo.data.playerTurn === this.player.player;
      document.querySelector('#user-profile img').src = `${conf.serverUrl}/assets/imgs/survivors/${this.player.slug}.png`;
    }
    this.survivors = gameInfo.data.survivors;
    this.gridOccupation = this.getGridOccupation(gameInfo.data);

    if (this.canvas !== undefined) {
      this.canvas.grid = this.grid;
      this.canvas.player = getPlayer(gameInfo.data.survivors);
      this.canvas.gridOccupation = this.getGridOccupation(gameInfo.data);
    };
  }

  updateCatched(gameInfo) {
    let survivors = gameInfo.data.catchedSurvivors,
        cleanText = (x) => x.innerHTML = "",
        characterList = document.querySelectorAll('#list-character li p');

    R.map(cleanText, characterList);

    for (let s in survivors) {
      document.querySelector(`#list-character .${s} p`).innerHTML = R.join(', ', survivors[s]);
    }
  }

  setGoals() {
    let player = game.player.player,
        ownGoals = document.querySelector('#own-goals').querySelector('span'),
        ownGoalsText = document.querySelector('#own-goals span').innerHTML,
        teamGoals = document.querySelector('#team-goals span'),
        teamGoalsText = document.querySelector('#team-goals span').innerHTML;

    ownGoalsText += game.missions[player].name + ": " + game.missions[player].description;
    ownGoals.innerHTML = ownGoalsText;

    for (let v in game.victoryConditions) {
      let vic = game.victoryConditions[v];
      teamGoalsText += vic['name'] + ": " + vic['description'];
    }
    teamGoals.innerHTML = teamGoalsText;
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

  getSurvivorById(id){
    return R.find(R.propEq("id", id), this.survivors);
  }

  setSurvivorClass(element, className){
    element.removeClass('pablo');
    element.removeClass('xenia');
    element.removeClass('miguel');
    element.removeClass('laura');
    element.removeClass('yami');
    element.removeClass('alex');
    element.addClass(className);
  }

  getItem(){
    this.stomp.sendMessage('GET_OBJECT', { item: this.foundItem });
    this.lightbox.hideAll();
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
            this.setGoals();
          } else if (message.type === "ANIMATION_ATTACK") {
            this.lightbox.hideAll();
            let survivor = this.getSurvivorById(message.data.id);
            this.setSurvivorClass($("#animation-attack .survivor"), survivor.slug);

            $("#animation-attack .info").text("Kill "+message.data.deaths+" zombies");

            this.lightbox.show('#animation-attack');

          } else if (message.type === "FIND_ITEM") {
            if (message.user == game.player.player) {
              this.lightbox.hideAll();

              $("#find-item .content .item1").attr("src","/assets/imgs/"+message.data.items[0].slug+".png");
              $("#find-item .content .info1 .item-title").text(message.data.items[0].name);
              $("#find-item .content .info1 .item-description").text(message.data.items[0].description);
              this.foundItem = message.data.items[0].id;

              this.lightbox.show('#find-item');
            }
          } else if (message.type === "ZOMBIE_TIME") {
            this.lightbox.hideAll();

            $("#zombie-time .survivors").html("");

            let i = 0;

            for (i=0; i<message.data.damages.length;i++) {
              let survivor = $("<img />");

              survivor.addClass("survivor");
              survivor.attr("src","/assets/imgs/survivors/" + message.data.damages[0].survivor + ".png");
              $("#zombie-time .survivors").append(survivor);


              let text = message.data.damages[0].damage + " damage";
              if (message.data.damages[0].death) {
                text += " (R.I.P.)";
              }

              survivor = $("<div />");
              survivor.addClass("survivor");
              survivor.text(text);
              $("#zombie-time .info").append(survivor);
            }

            $("#zombie-time .newzombies .text").text(message.data.numNewZombies + " new zombies!");
            this.lightbox.show('#zombie-time');
          } else if (message.type === "ZOMBIE_ATTACK") {
            this.lightbox.hideAll();
            let survivor = this.getSurvivorById(message.data.id);
            this.setSurvivorClass($("#zombie-attack .survivor"), survivor.slug);
            let text = "Does "+message.data.damage+" damage";
            if (message.data.death) {
              text += " (R.I.P.)";
            }
            $("#zombie-attack .info").text(text);
            this.lightbox.show('#zombie-attack');
          } else if (message.type === "END_GAME") {
            this.lightbox.hideAll();

            let text = "You lose :("

            if (message.data.win) {
                text = "You win!"
            }

            $("#end-game .win").text(text);

            $("#end-game .missions .mission").remove();
            let i=0;
            for (i=0;i < message.data.missions.length;i++) {
                let mission = $("<div />")
                mission.addClass(".mission");
                let text = message.data.missions[i].player + ": "+message.data.missions[i].name;
                if (message.data.missions[i].success){
                    text += " SUCCESS!"
                } else {
                    text += " FAIL"
                }
                mission.text(text);
                $("#end-game .missions").append(mission);
            }




            this.lightbox.show('#end-game');
          }

          this.canvas.redraw();
        },

        onCellClick = (e, cell) => {
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
          if (this.myTurn) {
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
          }
        };

    w.on("message.stomp.zt", onMessage);
    w.on("cellClick.canvas.zt", onCellClick);
    w.on("buttonClick.interface.zt", onInterfaceButtonClick);

  }
}
