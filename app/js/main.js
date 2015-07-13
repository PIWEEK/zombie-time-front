let canvas = new Canvas();

window.onresize = () => canvas.resize();


let test = () => {
  let imageSrc = "/assets/imgs/cat.gif";
  canvas.addObject("tokens", "cat", imageSrc, 0, 0);
  canvas.addObject("tokens", "cat2", imageSrc, 100, 100);
}();

canvas.el.onclick = function() {
  canvas.zoomIn();
};

canvas.el.oncontextmenu = function(e) {
  e.preventDefault();
  canvas.zoomOut();
};
