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

  getImageCoords(position) {
    return utils
      .getCellCoords(position, this.sizeX, this.sizeY);
  }
}
