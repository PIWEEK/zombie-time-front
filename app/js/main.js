let canvas = new Canvas();

window.onresize = () => canvas.resize();


let test = () => {
  let imageSrc = "/assets/imgs/cat.gif";
  canvas.addObject("tokens", "cat", imageSrc, 0, 0);
  canvas.addObject("tokens", "cat2", imageSrc, 100, 100);
}();

Mousetrap.bind('i', function() {
  canvas.zoomIn();
});

Mousetrap.bind('o', function() {
  canvas.zoomOut();
});

Mousetrap.bind('r', function() {
  canvas.zoomReset();
});
