/*global utils, R, Image, Transform, tileHeight, tileWidth, defaultZoomIncrement */

class Canvas {
  constructor() {
    let el = document.createElement("canvas");
    el.id = "mainCanvas";
    document.querySelector('#content').appendChild(el);
    this.el = el;
    this.ctx = el.getContext("2d");
    this.currentScale = 1;
    this.objects = {
      background: [],
      walls: [],
      objects: [],
      tokens: []
    };
    this.grid = {
      width: 16,
      height: 18
    };
    this.transform = new Transform();

    this.resize();
  }

  resize() {
    let viewportSize = utils.getViewportSize(),
        el = this.el;

    el.width = viewportSize.width;
    el.height = viewportSize.height;
    this.redraw();
  }

  redraw() {
    let viewportSize = utils.getViewportSize(),
        drawToken = this.drawToken.bind(this);

    this.transform.scale(this.currentScale, this.currentScale);
    this.applyTransform();
    this.ctx.clearRect(0, 0, this.grid.width * tileWidth, this.grid.height * tileHeight);

    R.forEach(drawToken, this.objects.tokens);
  }

  addObject(collection, name, imagePath, posX, posY) {
    let obj = {
      name: name,
      image: new Image(),
      imagePath: imagePath,
      posX: posX,
      posY: posY
    };

    this.objects[collection] = R.append(obj, this.objects[collection]);
    this.redraw();
  }

  removeObject(collection, name) {
    let differentName = R.compose(R.not, R.propEq("name", name));

    this.objects[collection] = R.filter(differentName, this.objects[collection]);
    this.redraw();
  }

  drawToken(token) {
    this.drawImage(token.image, token.imagePath, token.posX, token.posY);
  }

  drawImage(image, imagePath, posX, posY) {
    let alreadyRendered = R.compose(R.not, R.isEmpty)(image.src),
        ctx = this.ctx;

    if (alreadyRendered) {
      ctx.drawImage(image, posX, posY);
    } else {
      image.onload = function() {
        ctx.drawImage(this, posX, posY);
      };
      image.src = imagePath;
    }
  }

  zoomIn(delta) {
    let signedDelta = delta ? delta: defaultZoomIncrement;

    this.scale(signedDelta);
  }

  zoomOut(delta) {
    let signedDelta = delta ? delta * -1 : defaultZoomIncrement * -1,
        viewportSize = utils.getViewportSize(),
        currentZoom = this.transform.m[0],
        futureZoom = currentZoom + (currentZoom * signedDelta),
        totalBackgroundWidth = tileWidth * this.grid.width,
        futureBackgroundWidth = totalBackgroundWidth * futureZoom,
        canZoomOut = futureBackgroundWidth > viewportSize.width;

    this.scale(signedDelta);

    if (canZoomOut) this.scale(signedDelta);
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
        widthLimit = ((tileWidth * this.grid.width * m[0]) - viewportSize.width) * -1,
        heightLimit = ((tileHeight * this.grid.height * m[3]) - viewportSize.height) * -1;

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
}
