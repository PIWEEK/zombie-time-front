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
    this.musicActive = true
  }

  initialize(gameInfo) {
    this.initialized = true;
    this.parseGameInfo(gameInfo);
    this.canvas = new Canvas();
    this.canvas.map = this.map;
    this.canvas.grid = this.grid;
    this.canvas.resize();

    this.parseGameInfo(gameInfo);

    this.canvas.currentAction = "move"

  }

  startMusic(music){
    if (this.musicActive) {
      if (document.querySelector('#zt-music-survivor').paused){
        this.playMusic('select-survivor');
      }
    }
  }

  playMusic(music){
    if (this.musicActive) {
      document.querySelector('#zt-music').pause();
      document.querySelector('#zt-music-survivor').pause();
      document.querySelector('#zt-music-end').pause();

      if (music === 'select-survivor'){
        document.querySelector('#zt-music').volume = 0.1;
        document.querySelector('#zt-music-survivor').play();
        document.querySelector('#zt-music-survivor').loop = true;
      }
      if (music === 'game'){
        document.querySelector('#zt-music').play();
        document.querySelector('#zt-music').volume = 0.1;
        document.querySelector('#zt-music').loop = true;
      }
      if (music === 'end-game'){
        document.querySelector('#zt-music').volume = 0.1;
        document.querySelector('#zt-music-end').play();
        document.querySelector('#zt-music-end').loop = true;
      }
    }
  }

  playEffect(effect){
    if (this.musicActive) {
      document.querySelector('#zt-effect').src="/assets/data/"+effect+".ogg";
      document.querySelector('#zt-effect').play();
    }
  }

  toggleMusic(){
    if (game.musicActive) {
      document.querySelector('#zt-music').pause();
      document.querySelector('#zt-music-survivor').pause();
      document.querySelector('#zt-music-end').pause();
      game.musicActive = false;
    } else {
      document.querySelector('#zt-music').play();
      game.musicActive = true;
    }

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

    let processSearchPoints = (searchPointCell) => {
      this.grid[searchPointCell.point]["searchPoint"] = true;
    };

    let processVictoryConditions = (victoryConditionCell) => {
      this.grid[victoryConditionCell.point]["victoryCondition"] = true;
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

    R.forEach(processSearchPoints, gameInfo.data.searchPoints);
    R.forEach(processVictoryConditions, gameInfo.data.victoryConditions);


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


        if(this.player.currentLife !== undefined){
          console.log(this.player.defense.currentLevel);
          if(this.player.defense.currentLevel !== undefined){
              this.drawLife(this.player.currentLife, this.player.defense.currentLevel);
          } else {
            this.drawLife(this.player.currentLife, this.player.currentDefense);
          }
        }

        if(this.player.currentActions !== undefined){
            this.drawActions(this.player.currentActions);
        }

        if(this.player.weapon !== undefined){
            this.drawWeapon(this.player.weapon.slug);
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

  drawLife(life, defense){
      $("#user-profile .life .text").text(life);
      $("#user-profile .defense .text").text(defense);
  }

  drawActions(actions){
      $("#end-turn-button .actions").text(actions)
  }

  drawWeapon(weapon){
      $("#attack-button").css("background-image", "url(/assets/imgs/" + weapon + ".png)");
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
        characteristics += "<div class='defense defense-img'><div class='text'>"+item.currentLevel +"</div></div>";
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
      game.stomp.sendMessage('DISCARD_OBJECT', { item: $(item).data("id") });
      document.querySelector("#inventory-info").style.visibility='hidden';
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

  updatePregame(preGameInfo){
    this.startMusic();
    const username = utils.getQueryParams().username;
    let survivors = preGameInfo.data.survivors;
    const listCharacter = $("#choose-character .list-character");
    listCharacter.html("");
    for (let s in survivors) {
      let survivorData = survivors[s];
      let survivorContainer = $("<div class='container' />");
      let player = $("<div class='player' />");
      let survivor = $("<img class='survivor'/>");
      survivor.attr("src", "/assets/imgs/survivors/" + survivorData.slug + ".png");
      survivor.data("survivordata", survivorData);

      survivor.mouseover(function (e) {
        let s = $(this);
        game.previewSurvivor(s.data("survivordata"));
      });


      if (survivorData.player !== ""){
        survivor.addClass("selected");
        survivor.attr("draggable", false);
        player.text(survivorData.player);

        if (survivorData.player == username) {
          if (survivorData.leader) {
            $("#choose-character .team .leader img").attr("src", "/assets/imgs/survivors/" + survivorData.slug + ".png");
          } else {
            $("#choose-character .team .follower img").attr("src", "/assets/imgs/survivors/" + survivorData.slug + ".png");
          }
        }
      } else {
        player.text(" ");
        survivor.attr("draggable", true);
        survivor[0].addEventListener("dragstart", (ev) => {
          let s = $(ev.target);
          ev.dataTransfer.setData("slug", s.data("survivordata").slug);
        });
      }
      survivorContainer.append(survivor);
      survivorContainer.append(player);
      listCharacter.append(survivorContainer);

      if (preGameInfo.data.ready.indexOf(username) >= 0){
        $("#choose-character .ready .button").hide()
        $("#choose-character .ready .info").text("Ready "+preGameInfo.data.ready.length+"/"+preGameInfo.data.slots);
        $("#choose-character .ready .info").show();
      }
    }
  }

  selectTeam(ev, data){
    if (data!== undefined && data.slug !== undefined){
      game.stomp.sendMessage('SELECT_SURVIVOR', {leader: data.leader, survivor: data.slug});
    }
  }

  previewSurvivor(survivorData){
    $("#choose-character .selected-character .photo").attr("src", "/assets/imgs/survivors/" + survivorData.slug + ".png");
    $("#choose-character .selected-character .name").text(survivorData.name);
    $("#choose-character .selected-character .description").text(survivorData.description);
  }

  playerReady(){
    game.stomp.sendMessage('PLAYER_READY', {});
  }

  setGoals() {
    let player = game.player.player;
    document.querySelector("#goals #own-goals .title").innerHTML = "PERSONAL MISSION: "+game.missions[player].name;
    document.querySelector("#goals #own-goals .content").innerHTML = game.missions[player].description;;

    let teamGoalsText = "";
    for (let v in game.victoryConditions) {
      let vic = game.victoryConditions[v];
      teamGoalsText += vic['description']+"<br />";
    }
    document.querySelector("#goals #team-goals .title").innerHTML = "TEAM MISSION: "+game.victoryConditions[0]['name'];
    document.querySelector("#goals #team-goals .content").innerHTML = teamGoalsText;
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
      this.playEffect(weapon);
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
      this.playEffect("move");
      this.showGenericLog(survivor, "Moves");
  }

  showLogNoise(survivor){
      this.playEffect("noise");
      this.showGenericLog(survivor, "Makes noise");
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
      this.playEffect("search");
      this.showLogSearch(survivor);
      if (user == game.player.player) {
        this.lightbox.hideAll();

        $("#find-item .content .item1 .image").css("background-image", "url(/assets/imgs/" + items[0].slug + ".png)");
        $("#find-item .content .info1 .item-title").text(items[0].name);
        $("#find-item .content .info1 .item-description").text(items[0].description);

        if (items[0].currentAmmo !== undefined) {
            if (items[0].longRange === true) {
                document.querySelector("#find-item .content .item1 .ammo").className = "ammo bullet"+items[0].currentAmmo;
            } else {
                document.querySelector("#find-item .content .item1 .ammo").className = "ammo hit"+items[0].currentAmmo;
            }
        } else {
            document.querySelector("#find-item .content .item1 .ammo").className = "ammo hidden";
        }

        if (items[0].damage !== undefined) {
            document.querySelector("#find-item .content .item1 .damage").className = "damage";
            document.querySelector("#find-item .content .item1 .damage").innerHTML = "<span class='text'>" + items[0].damage + "</span>";
        } else {
            document.querySelector("#find-item .content .item1 .damage").className = "damage hidden";
        }

        if (items[0].currentLevel !== undefined) {
            document.querySelector("#find-item .content .item1 .defense").className = "defense";
            document.querySelector("#find-item .content .item1 .defense").innerHTML = "<span class='text'>" + items[0].currentLevel + "</span>";
        } else {
            document.querySelector("#find-item .content .item1 .defense").className = "defense hidden";
        }



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


  showError(text){
    const errorMessage = $("#error-message")
    errorMessage.text(text);
    errorMessage.css("margin-width", Math.round(errorMessage.width()/2));
    errorMessage.show();
    setTimeout(function(){ $("#error-message").hide(); }, 1000);
  }


  startTurn(user, survivor){
      this.playEffect("turn");
      this.showLogStartTurn(survivor);

      if (user == game.player.player) {
          $("#your-turn").show();
          setTimeout(function(){ $("#your-turn").hide(); }, 3000);
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
      }
  }

  showChat(dataSurvivor, dataText){
    let msg = $("<div />");
    msg.addClass("message");
    let img = $("<div />");
    img.addClass("survivor-img");
    img.addClass(dataSurvivor);
    msg.append(img);
    let text = $("<span />");
    text.addClass("text");
    text.text(dataText);
    msg.append(text);

    $("#chat .chat-messages").append(msg);

    $("#chat .chat-messages")[0].scrollTop = $("#chat .chat-messages")[0].scrollHeight;

    $("#chat").show();
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

  startGame(){
    $('#choose-character').hide();
    this.interface.show();
    this.finalCountDown();
    this.setGoals();
    this.playMusic('game');
  }

  endGame(data){
    this.lightbox.hideAll();

    let text = "You lose :("
    if (data.win) {
        text = "You win!"
    }

    $("#end-game .main-mission .result").text(text);

    $("#end-game .personal-missions .result").html("");
    R.forEachIndexed(function(missionInfo){
      let mission = $("<div />")
      mission.addClass("mission");
      let missionImage = $("<img />")
      missionImage.attr("src", "/assets/imgs/survivors/" + missionInfo.survivor + ".png");
      mission.append(missionImage);
      mission.append ( $("<div class='kills'>"+missionInfo.player+"</div>"));
      mission.append ( $("<div class='kills'>Killed " + missionInfo.kills + " zombies</div>"));

      mission.append($("<div class='name'>"+missionInfo.name+"</div>"));
      mission.append($("<div>"+missionInfo.description+"</div>"));
      if (missionInfo.success){
        mission.append($("<div class='success'>SUCCESS</div>"));
      } else {
        mission.append($("<div class='fail'>FAIL</div>"));
      }

      $("#end-game .personal-missions .result").append(mission);
    }, data.missions);

    $('#end-game').show();
    this.playMusic('end-game');
  }

  actionSearch(player){
    if (player.canSearch){
        this.sendSearchMessage();
        this.canvas.currentAction = "move";
    } else {
      if (player.currentActions == 0){
        this.showError("You haven't more actions!")
      } else if (player.currentInventory == player.inventory.length){
        this.showError("Your inventory is full")
      } else {
        this.showError("Your can't search there")
      }
    }
  }

  actionNoise(){
    if (this.player.currentActions == 0){
      this.showError("You haven't more actions!")
    } else {
      this.sendNoiseMessage();
      this.canvas.currentAction = "move";
    }
  }

  actionMove(player){
    if (player.currentActions == 0){
      this.showError("You haven't more actions!");
    } else if (player.canMoveTo.length == 0){
      this.showError("You can't move");
    } else {
      this.canvas.currentAction = "move";
    }
  }

  actionAttack(player){
    if (player.currentActions == 0){
      this.showError("You haven't more actions!");
    } else if (player.weapon.currentAmmo == 0){
      if (player.weapon.longRange) {
        this.showError("You have no ammo!");
      } else {
        this.showError("Your weapon is broken!");
      }
    } else if (player.canAttackTo.length == 0){
      this.showError("There are no zombies on range");
    } else if (player.canAttackTo.length == 1){
      this.sendAttackMessage(player.canAttackTo[0]);
      this.canvas.currentAction = "move";
    } else {
      this.canvas.currentAction = "attack";
    }
  }

  actionMoveUp(player){
    this.moveTo(player.point - this.map.sizeX);
  }

  actionMoveDown(player){
    this.moveTo(player.point + this.map.sizeX);
  }

  actionMoveLeft(player){
    this.moveTo(player.point - 1);
  }

  actionMoveRight(player){
    this.moveTo(player.point + 1);
  }

  moveTo(cell){
    if (this.player.currentActions == 0){
      this.showError("You haven't more actions!");
    } else if (R.contains(cell, this.player.canMoveTo)) {
      this.sendMoveMessage(cell);
      this.canvas.currentAction = "move";
    }
  }

  registerEventHandlers() {

    let w = $(window),
        onMessage = (e, message) => {

          switch(message.type) {
            case "PRE_GAME":
              this.updatePregame(message);
              break
            case "FULL_GAME":
              this.initialized ? this.parseGameInfo(message) : this.initialize(message);
              break
            case("START_GAME"):
              this.startGame();
              break;
            case ("ANIMATION_MOVE"):
              this.showLogMove(message.data.survivor);
              break;
            case ("ANIMATION_NOISE"):
              this.showLogNoise(message.data.survivor);
              break;
            case ("ANIMATION_ATTACK"):
              this.showLogAttack(message.data.survivor, message.data.weapon, message.data.deaths)
              break;
            case ("FIND_ITEM"):
              this.findItem(message.user, message.data.survivor, message.data.items);
              break;
            case ("ZOMBIE_TIME"):
              this.showZombieTime(message.data.damages, message.data.numNewZombies);
              break;
            case ("ZOMBIE_ATTACK"):
              this.showZombieAttack(message.user, message.data.survivor, message.data.damage, message.data.death);
              break;
            case ("END_GAME"):
              this.endGame(message.data);
              break;
          case ("START_TURN"):
            this.startTurn(message.user, message.data.survivor);
            break;
          case ("CHAT"):
              this.showChat(message.data.survivor, message.data.text);
              break;
          }
          if (this.canvas !== undefined) {
            this.canvas.redraw();
          }
        },

        onCellClick = (e, cell) => {
          if (this.canvas.currentAction == "move") {
              this.moveTo(cell)
          } else if (this.canvas.currentAction == "attack" && R.contains(cell, this.player.canAttackTo)) {
              if (this.player.canAttackTo.length > 0){
                  this.sendAttackMessage(cell);
                  this.canvas.currentAction = "move";
              }
          }
          this.canvas.redraw();
        },
        onInterfaceButtonClick = (e, action, searchMoreToken) => {
          console.log(this.player);
          if (action =="chat"){
              $("#chat").toggle();
          } else if (this.myTurn) {
            switch(action) {
            case "search":
              this.actionSearch(this.player)
              break;
            case "searchMore":
              this.sendSearchMoreMessage(searchMoreToken);
              this.canvas.currentAction = "move";
              break;
            case "noise":
              this.actionNoise();
              break;
            case "endTurn":
              this.sendEndTurnMessage();
              this.canvas.currentAction = "move";
              break;
            case "move":
              this.actionMove(this.player)
              break;
            case "moveUp":
              this.actionMoveUp(this.player)
              break;
            case "moveDown":
              this.actionMoveDown(this.player)
              break;
            case "moveLeft":
              this.actionMoveLeft(this.player)
              break;
            case "moveRight":
              this.actionMoveRight(this.player)
              break;
            case "attack":
              this.actionAttack(this.player)
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
    w.on("drop.interface.zt", this.selectTeam);
    w.on("buttonClick.ready.zt", this.playerReady);
    w.on("buttonClick.music.zt", this.toggleMusic);

    w.bind("contextmenu", function(e) {
      e.preventDefault();
    });

  }
}
