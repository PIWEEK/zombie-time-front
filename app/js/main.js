let canvas = new Canvas();

window.onresize = () => canvas.resize();


let test = () => {
  let imageSrc = "/assets/imgs/cat.gif";
  canvas.addObject("tokens", "cat", imageSrc, 0, 0);
  canvas.addObject("tokens", "cat2", imageSrc, 100, 100);
}();

Mousetrap.bind('i', function() {
  canvas.zoomIn(0.2);
});

Mousetrap.bind('o', function() {
  canvas.zoomOut(0.2);
});

Mousetrap.bind('r', function() {
  canvas.zoomReset();
});

canvas.el.onwheel = function(e) {
  if (e.deltaY >= 0) {
    canvas.zoomOut();
  } else {
    canvas.zoomIn();
  }
};
