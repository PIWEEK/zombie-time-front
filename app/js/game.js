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
    //document.querySelector('#zt-music').play();
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
    let processNoise = (noiseCell) => {
      this.grid[noiseCell.point]["noise"] = this.grid[noiseCell.point]["noise"] === undefined ? noiseCell.level : this.grid[noiseCell.point]["noise"] + noiseCell.level;
    };

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
    R.forEach(processNoise, gameInfo.data.noise);
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


    if (this.player !== undefined) {

        if(this.player.inventory !== undefined){
            this.drawInventory(this.player, this.player.inventory);
        }

        console.log(this.player.currentLife);
        if(this.player.currentLife !== undefined){
            console.log("OK", this.player.currentLife);
            this.drawLife(this.player.currentLife);
        }

        if(this.player.currentActions !== undefined){
            this.drawActions(this.player.currentActions);
        }

        if(this.player.weapon !== undefined){
            this.drawAmmo(parseInt(this.player.weapon.currentAmmo), this.player.weapon.longRange);
            this.drawDamage(parseInt(this.player.weapon.damage));
        }

        this.enableActionsButtons(this.player);
    }

  }

  enableActionsButtons(player){

      if ((this.player.currentActions === undefined) ||
           parseInt(this.player.currentActions) === 0){
               $("#move-button").addClass("nouse");
               $("#attack-button").addClass("nouse");
               $("#search-button").addClass("nouse");
               $("#noise-button").addClass("nouse");
      } else {
          $("#noise-button").removeClass("nouse");
          if (this.player.canMoveTo.length === 0){
              $("#move-button").addClass("nouse");
          } else {
              $("#move-button").removeClass("nouse");
          }

          if (this.player.canAttackTo.length === 0){
              $("#attack-button").addClass("nouse");
          } else {
              $("#attack-button").removeClass("nouse");
          }

          if (this.player.canSearch){
              $("#search-button").removeClass("nouse");
          } else {
              $("#search-button").addClass("nouse");
          }
      }
  }

  drawLife(life){
      $("#user-profile .life .text").text(life)
  }

  drawActions(actions){
      $("#end-turn-button .actions").text(actions)
  }

  drawAmmo(ammo, longRange){
      $("#attack-button.menu-element .ammo").removeClass("bullet1");
      $("#attack-button.menu-element .ammo").removeClass("bullet2");
      $("#attack-button.menu-element .ammo").removeClass("bullet3");
      $("#attack-button.menu-element .ammo").removeClass("bullet4");
      $("#attack-button.menu-element .ammo").removeClass("bullet5");

      $("#attack-button.menu-element .ammo").removeClass("hit1");
      $("#attack-button.menu-element .ammo").removeClass("hit2");
      $("#attack-button.menu-element .ammo").removeClass("hit3");
      $("#attack-button.menu-element .ammo").removeClass("hit4");
      $("#attack-button.menu-element .ammo").removeClass("hit5");

      if ((ammo > 0) && (ammo<6)) {
          if (longRange === true) {
              $("#attack-button.menu-element .ammo").addClass("bullet"+ammo);
          } else {
              $("#attack-button.menu-element .ammo").addClass("hit"+ammo);
          }
      }

  }

  drawDamage(damage){
      $("#attack-button.menu-element .damage .text").text(damage)
  }

  drawInventory(player, inventory){
      const currentInventory = parseInt(player.currentInventory);
      $("#inventory .content").html("")
      let i = 0;
      for (i=0;i<inventory.length;i++){

          let item = $("<div />");
          item.addClass("item");
          item.addClass("item"+currentInventory);


          let img = $("<img />");
          img.attr("src","/assets/imgs/"+inventory[i].slug+".png");
          img.data("id", inventory[i].id);
          img.data("item", inventory[i]);
          item.append(img);
          $("#inventory .content").append(item);


          if ((inventory[i].id == player.defense.id) ||
          (inventory[i].id == player.weapon.id)){
              item.addClass("selected");
          }

          item.mousedown(function (e) {
              e.preventDefault();
              const img = $(this).find("img");
              switch (e.which) {
                case 1:
                    game.useItem(img);
                    break;
                case 3:
                    if (!$(this).hasClass("selected"))
                    game.discardItem(img);
                    break;
                default:
                    break;
            }
          });

          img.mouseover(function (e) {
            let item = $(this);
            game.showInventoryItem(item.data("item"));
          });
      }

      for (i=inventory.length;i<currentInventory;i++){
          let item = $("<div />");
          item.addClass("item");
          item.addClass("item"+currentInventory);
          $("#inventory .content").append(item);
      }

      for (i=currentInventory;i<6;i++){
          let item = $("<div />");
          item.addClass("item");
          item.addClass("invalid");
          item.addClass("item"+currentInventory);
          $("#inventory .content").append(item);
      }

  }

  showInventoryItem(item){
      const info = $("#inventory-info");
      info.find(".name").text(item.name);
      info.find(".image").attr("src","/assets/imgs/"+item.slug+".png");
      info.find(".description").text(item.description);

      let characteristics = "";


      if (item.currentLevel){
        characteristics += "<div class='damage damage-img'><div class='text'>"+item.currentLevel +"</div></div>";
      }

      if (item.damage){
          characteristics += "<div class='damage damage-img'><div class='text'>"+item.damage +"</div></div>";
          if (item.longRange === true) {
            characteristics += "<div class='ammo bullet" + item.currentAmmo + "' />";
          } else {
            characteristics += "<div class='ammo hit" + item.currentAmmo + "' />";
          }
      }


      info.find(".characteristics").html(characteristics);




      info.css('visibility', 'visible');
  }

  useItem(item){
      document.querySelector("#inventory-info").style.visibility='hidden';
      this.stomp.sendMessage('USE_OBJECT', { item: $(item).data("id") });
  }

  discardItem(item){
      this.stomp.sendMessage('DISCARD_OBJECT', { item: $(item).data("id") });
  }

  unequip(item){
      this.stomp.sendMessage('UNEQUIP', { item: $(item).data("id") });
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

  sendChatMessage(text) {
    this.stomp.sendMessage("CHAT", {text: text});
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

  showLogAttack(survivor, weapon, deaths){
      let logEntry = $("<div />");
      let survivorImg = $("<div />");
      survivorImg.addClass("survivor-img");
      survivorImg.addClass(survivor);
      logEntry.append(survivorImg);
      let text = $("<span />");
      text.text("Attacks with " + weapon + " and kills "+deaths);
      logEntry.append(text);

      let zombieImg = $("<div />");
      zombieImg.addClass("survivor-img");
      zombieImg.addClass("zombie");
      logEntry.append(zombieImg);

      $("#log").append(logEntry);

      document.querySelector("#log").scrollTop = document.querySelector("#log").scrollHeight;
  }

  showLogZombieAttack(survivor, damage, death){
      let logEntry = $("<div />");

      let zombieImg = $("<div />");
      zombieImg.addClass("survivor-img");
      zombieImg.addClass("zombie");
      logEntry.append(zombieImg);

      let text = $("<span />");
      text.text("Does "+damage+ " damage to ");
      logEntry.append(text);

      let survivorImg = $("<div />");
      survivorImg.addClass("survivor-img");
      survivorImg.addClass(survivor);
      logEntry.append(survivorImg);

      if (death) {
          let text = $("<span />");
          text.text(" (R.I.P)");
          logEntry.append(text);
      }

      $("#log").append(logEntry);

      document.querySelector("#log").scrollTop = document.querySelector("#log").scrollHeight;
  }

  showLogSearch(survivor){
      this.showGenericLog(survivor, "Search the room");
  }

  showLogMove(survivor){
      this.showGenericLog(survivor, "Moves");
  }

  showLogStartTurn(survivor){
      this.showGenericLog(survivor, "START TURN!");
  }

  showGenericLog(survivor, text){
      let logEntry = $("<div />");
      let survivorImg = $("<div />");
      survivorImg.addClass("survivor-img");
      survivorImg.addClass(survivor);
      logEntry.append(survivorImg);
      let spn = $("<span />");
      spn.text(text);
      logEntry.append(spn);

      $("#log").append(logEntry);

      document.querySelector("#log").scrollTop = document.querySelector("#log").scrollHeight;
  }

  findItem(user, survivor, items){
      this.showLogSearch(survivor);
      if (user == game.player.player) {
        this.lightbox.hideAll();

        $("#find-item .content .item1").attr("src","/assets/imgs/"+items[0].slug+".png");
        $("#find-item .content .info1 .item-title").text(items[0].name);
        $("#find-item .content .info1 .item-description").text(items[0].description);
        this.foundItem = items[0].id;

        this.lightbox.show('#find-item');
      }
  }

  showZombieAttack(user, survivor, damage, death){
      this.showLogZombieAttack(survivor, damage, death);
      if (user == game.player.player) {
        this.lightbox.hideAll();
        this.setSurvivorClass($("#zombie-attack .survivor"), survivor);
        let text = "Does "+damage+" damage";
        if (death) {
          text += " (R.I.P.)";
        }
        $("#zombie-attack .info").text(text);
        this.lightbox.show('#zombie-attack');
    }
  }



  startTurn(user, survivor){
      this.showLogStartTurn(survivor);

      if (user == game.player.player) {
          $("#move-button").css("visibility", "visible");
          $("#attack-button").css("visibility", "visible");
          $("#search-button").css("visibility", "visible");
          $("#noise-button").css("visibility", "visible");
          $("#end-turn-button").css("visibility", "visible");
      } else {

          $("#move-button").css("visibility", "hidden");
          $("#attack-button").css("visibility", "hidden");
          $("#search-button").css("visibility", "hidden");
          $("#noise-button").css("visibility", "hidden");
          $("#end-turn-button").css("visibility", "hidden");

          $("#log").removeClass("closed");
          $("#log").removeClass("small");
      }
  }



  showZombieTime(damages, numNewZombies){
      this.showGenericLog("zombie", "ZOMBIE TIME");
      this.lightbox.hideAll();

      document.querySelector('#zt-audio').play();

      $("#zombie-time .survivors").html("");

      let i = 0;
      $("#zombie-time .survivors").html("");
      $("#zombie-time .info").html("");
      for (i=0; i<damages.length;i++) {
          let survivorImg = $("<div />");
          survivorImg.addClass("survivor");
          survivorImg.addClass(damages[i].survivor);

          $("#zombie-time .survivors").append(survivorImg);


          let text = damages[i].damage + " damage";
          if (damages[i].death) {
            text += " (R.I.P.)";
          }

          let survivor = $("<div />");
          survivor.addClass("survivor");
          survivor.text(text);
          $("#zombie-time .info").append(survivor);
      }

      $("#zombie-time .newzombies .text").text(numNewZombies + " new zombies!");
      this.lightbox.show('#zombie-time');
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
          } else if (message.type === "ANIMATION_MOVE") {
              this.showLogMove(message.data.survivor);
          } else if (message.type === "ANIMATION_ATTACK") {
              this.showLogAttack(message.data.survivor, message.data.weapon, message.data.deaths)
          } else if (message.type === "FIND_ITEM") {
              this.findItem(message.user, message.data.survivor, message.data.items);
          } else if (message.type === "ZOMBIE_TIME") {
              this.showZombieTime(message.data.damages, message.data.numNewZombies);
          } else if (message.type === "ZOMBIE_ATTACK") {
            this.showZombieAttack(message.user, message.data.survivor, message.data.damage, message.data.death);
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
          } else if (message.type === "START_TURN") {
            this.startTurn(message.user, message.data.survivor);
          } else if (message.type === "CHAT") {
              let msg = $("<div />");
              msg.addClass("message");
              let img = $("<div />");
              img.addClass("survivor-img");
              img.addClass(message.data.survivor);
              msg.append(img);
              let text = $("<span />");
              text.addClass("text");
              text.text(message.data.text);
              msg.append(text);

              $("#chat .chat-messages").append(msg);

              $("#chat .chat-messages")[0].scrollTop = $("#chat .chat-messages")[0].scrollHeight;

              $("#chat").show();

          }

          this.canvas.redraw();
        },

        onCellClick = (e, cell) => {
          if (this.canvas.currentAction == "move" && R.contains(cell, this.player.canMoveTo)) {
              if (this.player.canMoveTo.length > 0){
                  this.sendMoveMessage(cell);
                  this.canvas.currentAction = undefined;
              }
          } else if (this.canvas.currentAction == "attack" && R.contains(cell, this.player.canAttackTo)) {
              if (this.player.canAttackTo.length > 0){
                  this.sendAttackMessage(cell);
                  this.canvas.currentAction = undefined;
              }
          }
          this.canvas.redraw();
        },
        onInterfaceButtonClick = (e, action, searchMoreToken) => {

          if (action =="chat"){
              $("#chat").toggle();
          } else if (this.myTurn) {
            switch(action) {
            case "search":
                if (this.player.canSearch){
                    this.sendSearchMessage();
                    this.canvas.currentAction = undefined;
                }
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
      },
      onSendChat = (e) => {
          let text = document.querySelector(".chat-text").value;
          document.querySelector(".chat-text").value = "";
          this.sendChatMessage(text);
      },

      onToggleLog = () => {
          if ($("#log").hasClass("closed")){
              $("#log").removeClass("closed");
          } else if ($("#log").hasClass("small")){
              $("#log").removeClass("small");
              $("#log").addClass("closed");
          } else {
              $("#log").addClass("small");
          }

      };

    w.on("message.stomp.zt", onMessage);
    w.on("cellClick.canvas.zt", onCellClick);
    w.on("buttonClick.interface.zt", onInterfaceButtonClick);
    w.on("sendChat.interface.zt", onSendChat);
    w.on("toggleLog.interface.zt", onToggleLog);

    w.bind("contextmenu", function(e) {
      e.preventDefault();
    });
  }
}
