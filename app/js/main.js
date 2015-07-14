/*global $, Canvas, Promise, Mousetrap */

let canvas = new Canvas();

window.onresize = () => canvas.resize();

let test = () => {
  let imageSrc = "/assets/imgs/tile.png";
  canvas.addObject("tokens", "cat", imageSrc, 0, 0);
}();


/**********************************************
 * Keybindings
 **********************************************/
Mousetrap.bind('i', function() {
  canvas.zoomIn(0.4);
});

Mousetrap.bind('o', function() {
  canvas.zoomOut(0.4);
});

Mousetrap.bind('r', function() {
  canvas.zoomReset();
});

Mousetrap.bind('h', function() {
  $('#help').show();
}, 'keydown');

Mousetrap.bind('h', function() {
  $('#help').hide();
}, 'keyup');


/**********************************************
 * Mouse scroll
 **********************************************/
canvas.el.onwheel = function(e) {
  if (e.deltaY >= 0) {
    canvas.zoomOut();
  } else {
    canvas.zoomIn();
  }
};


/**********************************************
 * Drag and Drop
 **********************************************/
canvas.el.addEventListener("mousedown", function(e) {
  canvas.drag = {
    x: e.x,
    y: e.y
  };
});

canvas.el.addEventListener("mousemove", function(e) {
  if (canvas.drag) {
    let deltaX = e.x - canvas.drag.x,
        deltaY = e.y - canvas.drag.y;

    canvas.drag.x = e.x;
    canvas.drag.y = e.y;

    canvas.translate(deltaX, deltaY);
    canvas.redraw();
  }
});

canvas.el.addEventListener("mouseup", function(e) {
  canvas.drag = undefined;
});

canvas.el.addEventListener("mouseleave", function(e) {
  canvas.drag = undefined;
});
