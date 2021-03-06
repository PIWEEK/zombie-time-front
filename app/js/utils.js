/*global Image, location, conf */

let utils = {
  getViewportSize: () => {
    return { width: window.innerWidth, height: window.innerHeight };
  },
  loadImage: (imageUrl) => {
    return new Promise((resolve, reject) => {
      let image = new Image();
      image.onload = () => resolve(image);
      image.src = imageUrl;
    });
  },
  getCellCoords: (position, sizeX, sizeY) => {
    let cellFloor = position % sizeX,
        cellModule = Math.floor(position / sizeX);

    return { x: cellFloor, y: cellModule };
  },
  getCellForCoords: (x, y, sizeX) => {
    let posX = Math.floor(x / conf.tileWidth),
        posY = Math.floor(y / conf.tileHeight);

    return (posY * sizeX) + posX;
  },
  getQueryParams: () => {
    let searchString = location.search;

    if (searchString === "") {
      return undefined;
    }

    if (searchString[0] == "?") {
      searchString = searchString.slice(1, searchString.length);
    }

    let pairs = R.split("&", searchString),
        queryParams = {},
        processPair = (pairString) => {
          let pair = R.split("=", pairString);

          queryParams[R.head(pair)] = R.last(pair);
        };

    R.map(processPair, pairs);

    return queryParams;
  }
};
