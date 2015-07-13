/*global utils, R, Image */

class Canvas {
  constructor() {
    let el = document.createElement("canvas");
    el.id = "mainCanvas";
    document.querySelector('#content').appendChild(el);
    this.el = el;
    this.ctx = el.getContext("2d");
    this.scale = 1;
    this.objects = {
      background: [],
      walls: [],
      objects: [],
      tokens: []
    };

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

    this.ctx.scale(this.scale, this.scale);
    this.ctx.clearRect(0, 0, viewportSize.width, viewportSize.height);

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
    this.scale += delta ? delta : 0.07;
    this.redraw();
    this.scale = 1;
  }

  zoomOut(delta) {
    this.scale -= delta ? delta : 0.07;
    this.redraw();
    this.scale = 1;
  }

  zoomReset() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.redraw();
  }
}
