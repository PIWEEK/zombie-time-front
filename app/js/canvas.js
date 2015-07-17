/*global $, utils, R, Image, Transform, Sprite, conf, Mousetrap */

class Canvas {
  constructor() {
    this.zombieTime = false;
    this.gameSprite = new Sprite(
      conf.serverUrl + "/assets/imgs/tile.png",
      conf.tileWidth,
      conf.tileHeight,
      conf.spriteSizeX,
      conf.spriteSizeY
    );
    let el = document.createElement("canvas");
    el.id = "mainCanvas";
    document.querySelector('#content').appendChild(el);
    this.el = el;
    this.ctx = el.getContext("2d");
    this.currentScale = 1;
    this.grid = {};
    this.map = {};
    this.transform = new Transform();

    this.registerEvents();
  }

  resize() {
    let viewportSize = utils.getViewportSize(),
        el = this.el;

    el.width = viewportSize.width;
    el.height = viewportSize.height;
    this.redraw();
  }

  redraw() {
    const drawCell = (cellNumber, cellContent) => {
      const cellOccupation = R.prop(cellNumber, this.gridOccupation),
            getTypeOccupation = (type) => {
              if (cellOccupation === undefined) {
                return 0;
              } else {
                if (cellOccupation[type] === undefined) {
                  return 0;
                } else {
                  return cellOccupation[type];
                }
              }
            },
            zombieOccupation = getTypeOccupation("zombies"),
            survivorOccupation = getTypeOccupation("survivors"),
            totalOccupation = zombieOccupation + survivorOccupation,
            drawBackgroundInCell = R.curry(this.drawBackground.bind(this))(R.__, cellNumber),
            drawZombieInCell = R.curry(this.drawCharacter.bind(this))(R.__, cellNumber, "zombie", R.__, zombieOccupation, totalOccupation),
            drawSurvivorInCell = R.curry(this.drawCharacter.bind(this))(R.__, cellNumber, "survivor", R.__, survivorOccupation, totalOccupation);

      drawBackgroundInCell(cellContent.floor);
      drawBackgroundInCell(cellContent.wall);
      drawBackgroundInCell(cellContent.item);
      if (cellContent.zombies) {
        R.forEachIndexed((val, idx, list) => drawZombieInCell(val.avatar, idx), cellContent.zombies);
      }
      if (cellContent.survivors) {
        R.forEachIndexed((val, idx, list) => drawSurvivorInCell(val.avatar, idx), cellContent.survivors);
      }
      if (cellContent.noise) {
        this.drawNoise(cellNumber, cellContent.noise);
      }
    };

    let viewportSize = utils.getViewportSize();

    this.transform.scale(this.currentScale, this.currentScale);
    this.applyTransform();

    this.gameSprite.loadPromise.then(() => {
      this.ctx.clearRect(0, 0, this.map.sizeX * conf.tileWidth, this.map.sizeY * conf.tileHeight);
      R.forEach((el) => drawCell(el[0], el[1]), R.toPairs(this.grid));
      if (this.currentAction == "move") {
        this.ctx.globalAlpha = 0.4;
        this.ctx.fillStyle = "#3333FF";
        R.forEach(this.drawRectangle.bind(this), this.player.canMoveTo);
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = "#000000";
      } else if (this.currentAction == "attack") {
        this.ctx.globalAlpha = 0.4;
        this.ctx.fillStyle = "#FF0000";
        R.forEach(this.drawRectangle.bind(this), this.player.canAttackTo);
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = "#000000";
      }
    });
  }

  getCellCoords(position) {
    return utils.getCellCoords(position, this.map.sizeX, this.map.sizeY);
  }

  drawRectangle(cellPos) {
    let cellCoords = this.getCellCoords(cellPos);

    this.ctx.fillRect(cellCoords.x * conf.tileWidth, cellCoords.y * conf.tileWidth, conf.tileWidth, conf.tileHeight);
  }

  drawBackground(spritePos, cellPos) {
    let spriteCoords = this.gameSprite.getImageCoords(spritePos),
        sx = spriteCoords.x * this.gameSprite.imageWidth,
        sy = spriteCoords.y * this.gameSprite.imageHeight,
        cellCoords = this.getCellCoords(cellPos),
        dx = cellCoords.x * conf.tileWidth,
        dy = cellCoords.y * conf.tileHeight;

      this.ctx.drawImage(
        this.gameSprite.image,
        sx, sy, this.gameSprite.imageWidth, this.gameSprite.imageHeight,
        dx, dy, conf.tileWidth, conf.tileHeight);
  }

  drawNoise(cellPos, noiseLevel) {
    let cellCoords = this.getCellCoords(cellPos),
        dx = cellCoords.x * conf.tileWidth,
        dy = cellCoords.y * conf.tileHeight;

    utils.loadImage(`${conf.serverUrl}/assets/imgs/botonruidocasilla.png`).then((image) => {
      this.ctx.drawImage(
        image,
        0, 0, 64, 64,
        dx, dy, 64, 64);

      this.ctx.fillStyle = "#FFFFFF";
      this.ctx.font = "35px Dead";
      this.ctx.fillText(noiseLevel, dx + 20, dy + 47);
      this.ctx.fillStyle = "#000000";
    });
  }

  drawCharacter(spritePos, cellPos, type, number, typeOccupation, totalOccupation) {
    if (this.zombieTime && type === "zombie") {
      let specialZombiePositions = [1, 2, 3, 4, 5],
          random = (limit) => { return Math.floor(Math.random() * limit); },
          randomZombieSpritePos = specialZombiePositions[random(specialZombiePositions.length)];

      spritePos = randomZombieSpritePos;
    }

    let spriteCoords = this.gameSprite.getImageCoords(spritePos),
        sx = spriteCoords.x * this.gameSprite.imageWidth,
        sy = spriteCoords.y * this.gameSprite.imageHeight,
        cellCoords = this.getCellCoords(cellPos),
        dx = cellCoords.x * conf.tileWidth,
        dy = cellCoords.y * conf.tileHeight + (conf.tileHeight / 4),
        halfTileWidth = conf.tileWidth / 2,
        halfTileHeight = conf.tileHeight / 2;

    if (typeOccupation < totalOccupation) {
      if (type === "zombie") {
        this.ctx.drawImage(
          this.gameSprite.image,
          sx, sy, this.gameSprite.imageWidth, this.gameSprite.imageHeight,
          dx, dy, halfTileWidth, halfTileHeight);

        if (typeOccupation > 1) {
          let radius = conf.tileWidth / 8,
              x = dx + (conf.tileWidth / 2) - 20,
              y = dy + (conf.tileWidth / 2) - 20,
              startAngle = 0,
              endingAngle = 2 * Math.PI;

          // contorno del círculo 800000
          this.ctx.beginPath();
          this.ctx.arc(x, y, radius, startAngle, endingAngle);
          // Contorno
          this.ctx.lineWidth = 5;
          this.ctx.fillStyle = "#800000";
          this.ctx.stroke();
          this.ctx.lineWidth = 1;
          // Interior
          this.ctx.fillStyle="#F5D8D8";
          this.ctx.fill();
          // Texto
          this.ctx.fillStyle = "#7E0101";
          this.ctx.font = "55px Dead";
          this.ctx.fillText(typeOccupation, x - (conf.tileWidth / 16) + 5, y + (conf.tileWidth / 16) + 3);
          this.ctx.fillStyle = "#000000";
        }
      } else {
        // antes de pintar, typeOccupation nos da un shift hacia arriba que tenemos que pintar teniendo en cuenta number
        let shift = 25 * number;

        this.ctx.drawImage(
          this.gameSprite.image,
          sx, sy, this.gameSprite.imageWidth, this.gameSprite.imageHeight,
          dx + (conf.tileWidth / 2), dy - shift, halfTileWidth, halfTileHeight);
      }
    } else {
      if (type === "zombie") {
        this.ctx.drawImage(
          this.gameSprite.image,
          sx, sy, this.gameSprite.imageWidth, this.gameSprite.imageHeight,
          dx + (conf.tileWidth / 4), dy, halfTileWidth, halfTileHeight);

        if (typeOccupation > 1) {
          let radius = conf.tileWidth / 8,
              x = dx + ((conf.tileWidth / 4) * 3) - 20,
              y = dy + (conf.tileWidth / 2) - 20,
              startAngle = 0,
              endingAngle = 2 * Math.PI;

          // contorno del círculo 800000
          this.ctx.beginPath();
          this.ctx.arc(x, y, radius, startAngle, endingAngle);
          // Contorno
          this.ctx.lineWidth = 5;
          this.ctx.fillStyle = "#800000";
          this.ctx.stroke();
          this.ctx.lineWidth = 1;
          // Interior
          this.ctx.fillStyle="#F5D8D8";
          this.ctx.fill();
          // Texto
          this.ctx.fillStyle = "#7E0101";
          this.ctx.font = "55px Dead";
          this.ctx.fillText(typeOccupation, x - (conf.tileWidth / 16) + 5, y + (conf.tileWidth / 16) + 3);
          this.ctx.fillStyle = "#000000";
        }
      } else {
        let shift = 25 * number;

        this.ctx.drawImage(
          this.gameSprite.image,
          sx, sy, this.gameSprite.imageWidth, this.gameSprite.imageHeight,
          dx + (conf.tileWidth / 4), dy - shift, halfTileWidth, halfTileHeight);
      }
    }
  }

  zoomIn(delta) {
    let signedDelta = delta ? delta : conf.defaultZoomIncrement,
        viewportSize = utils.getViewportSize(),
        currentZoom = this.transform.m[0],
        futureZoom = currentZoom + (currentZoom * signedDelta),
        futureTilesWidth = conf.tileWidth * conf.maxTilesWhenZoomIn * futureZoom,
        canZoomIn = futureTilesWidth < viewportSize.width;

    if (canZoomIn) {
      this.scale(signedDelta);
    } else {
      this.zoomInToMax();
    }
  }

  zoomOut(delta) {
    let signedDelta = delta ? delta * -1 : conf.defaultZoomIncrement * -1,
        viewportSize = utils.getViewportSize(),
        currentZoom = this.transform.m[0],
        futureZoom = currentZoom + (currentZoom * signedDelta),
        futureBackgroundWidth = conf.tileWidth * this.map.sizeX * futureZoom,
        canZoomOut = futureBackgroundWidth > viewportSize.width;

    if (canZoomOut) {
      this.scale(signedDelta);
    } else {
      this.zoomOutToMax();
    }
  }

  zoomInToMax() {
    let tilesWidth = conf.tileWidth * conf.maxTilesWhenZoomIn,
        viewportSize = utils.getViewportSize(),
        zoomToApply = viewportSize.width / tilesWidth,
        currentZoom = this.transform.m[0],
        scaleToApply = (zoomToApply - currentZoom) / currentZoom;

    this.scale(scaleToApply);
  }

  zoomOutToMax() {
    let viewportSize = utils.getViewportSize(),
        totalBackgroundWidth = conf.tileWidth * this.map.sizeX,
        currentZoom = this.transform.m[0],
        zoomToApply = viewportSize.width / totalBackgroundWidth,
        scaleToApply = (zoomToApply - currentZoom) / currentZoom;

    this.scale(scaleToApply);
  }

  zoomReset() {
    this.transform.reset();
    this.applyTransform();
    this.redraw();
  }

  scale(scale) {
    this.currentScale += scale;
    this.redraw();
    this.currentScale = 1;
  }

  translate(x, y) {
    this.transform.translate(x, y);
    this.applyTransform();
  }

  applyTransform() {
    let m = this.transform.m,
        viewportSize = utils.getViewportSize(),
        widthLimit = ((conf.tileWidth * this.map.sizeX * m[0]) - viewportSize.width) * -1,
        heightLimit = ((conf.tileHeight * this.map.sizeY * m[3]) - viewportSize.height) * -1;

    if (m[4] > 0) {
      m[4] = 0;
    } else if (m[4] < widthLimit) {
      m[4] = widthLimit;
    }


    if (m[5] > 0) {
      m[5] = 0;
    } else if (m[5] < heightLimit) {
      m[5] = heightLimit;
    }

    this.ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
  }

  getRelativeMouseCoords(x, y) {
    let m = this.transform.m,
        relX = (Math.abs(m[4]) + x) / m[0],
        relY = (Math.abs(m[5]) + y) / m[3];

    return { x: relX, y: relY };
  }

  registerEvents() {
    /**********************************************
     * Window events
     **********************************************/
    window.onresize = () => this.resize();


    /**********************************************
     * Keybindings
     **********************************************/
    Mousetrap.bind('i', () => {
      this.zoomIn(0.4);
    });

    Mousetrap.bind('o', () => {
      this.zoomOut(0.4);
    });

    Mousetrap.bind('r', () => {
      this.zoomReset();
    });


    /**********************************************
     * Mouse scroll
     **********************************************/
    this.el.onwheel = (e) => {
      if (e.deltaY >= 0) {
        this.zoomOut();
      } else {
        this.zoomIn();
      }
    };


    /**********************************************
     * Drag and Drop
     **********************************************/
    this.el.addEventListener("mousedown", (e) => {
      this.drag = {
        x: e.x,
        y: e.y,
        initialX: e.x,
        initialY: e.y
      };
    });

    this.el.addEventListener("mousemove", (e) => {
      if (this.drag) {
        let deltaX = e.x - this.drag.x,
            deltaY = e.y - this.drag.y;

        this.drag.x = e.x;
        this.drag.y = e.y;

        this.translate(deltaX, deltaY);
        this.redraw();
      }
    });

    let isClick = (x, y, drag) => {
      let d = conf.clickPixelDelta;

      return drag.initialX + d >= x && drag.initialX - d <= x && drag.initialY + d >= y && drag.initialY - d <= y;
    };

    this.el.addEventListener("mouseup", (e) => {
      if (isClick(e.x, e.y, this.drag)) {
        let w = $(window),
            mouseCoords = this.getRelativeMouseCoords(e.x, e.y),
            clickedCell = utils.getCellForCoords(mouseCoords.x, mouseCoords.y, this.map.sizeX);

        w.trigger("cellClick.canvas.zt", clickedCell);
      }

      this.drag = undefined;
    });

    this.el.addEventListener("mouseleave", (e) => {
      this.drag = undefined;
    });
  }
}
