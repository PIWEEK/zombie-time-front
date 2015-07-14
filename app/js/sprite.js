/*global utils */

class Sprite {
  constructor(url, imageWidth, imageHeight, sizeX, sizeY) {
    this.imageWidth = imageWidth;
    this.imageHeight = imageHeight;
    this.sizeX = sizeX;
    this.sizeY = sizeY;

    this.loadPromise = utils.loadImage(url);
    this.loadPromise.then((image) => {
      this.image = image;
    });
  }

  drawImage(num, ctx, posX, posY) {
    let floor = Math.floor(num / this.sizeX),
        module = num % this.sizeX,
        sx = (floor - 1) * this.imageWidth,
        sw = this.imageWidth,
        sh = this.imageHeight,
        dw = posX,
        dh = posY;

    ctx.drawImage(this, sx, 0, sw, sh, 0, 0, dw, dh);
  }
}
