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
    let floor = num % this.sizeX,
        module = Math.floor(num / this.sizeX),
        sx = floor * this.imageWidth,
        sw = this.imageWidth,
        sh = this.imageHeight,
        dw = posX,
        dh = posY;

    debugger;

    ctx.drawImage(this.image, sx, 0, sw, sh, 0, 0, dw, dh);
  }

  getImageCoords(position) {
    return utils
      .getCellCoords(position, this.sizeX, this.sizeY);
  }
}
