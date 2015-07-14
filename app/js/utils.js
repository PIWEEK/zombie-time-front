/*global Image */

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
  }
};
