/*global $, utils, R, Image, Transform, Sprite, conf, Mousetrap */

class Canvas {
  constructor() {
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
      const drawImageInCell = R.curry(this.drawImage.bind(this))(R.__, cellNumber);

      drawImageInCell(cellContent.floor);
      drawImageInCell(cellContent.wall);
      drawImageInCell(cellContent.item);
      //R.forEach(drawImageInCell, cellContent.objects);
      //R.forEach(drawImageInCell, cellContent.characters);
    };

    let viewportSize = utils.getViewportSize();

    this.transform.scale(this.currentScale, this.currentScale);
    this.applyTransform();
    this.ctx.clearRect(0, 0, this.map.sizeX * conf.tileWidth, this.map.sizeY * conf.tileHeight);

    this.gameSprite.loadPromise.then(() => R.forEach((el) => drawCell(el[0], el[1]), R.toPairs(this.grid)));
  }

  getCellCoords(position) {
    return utils.getCellCoords(position, this.map.sizeX, this.map.sizeY);
  }

  drawImage(spritePos, cellPos) {
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

  registerEvents() {
    /**********************************************
     * Window events
     **********************************************/
    window.onresize = () => this.resize();


    /**********************************************
     * Keybindings
     **********************************************/
    Mousetrap.bind('i', () => {
      console.log('------------------------');
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
        y: e.y
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

    this.el.addEventListener("mouseup", (e) => {
      this.drag = undefined;
    });

    this.el.addEventListener("mouseleave", (e) => {
      this.drag = undefined;
    });
  }
}
