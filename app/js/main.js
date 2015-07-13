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

Mousetrap.bind('?', function() {
  $('#help').show();
}, 'keydown');

Mousetrap.bind('?', function() {
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
  console.log(`DRAG START { x: ${e.x}, y: ${e.y} }`);
});

canvas.el.addEventListener("mousemove", function(e) {
  if (canvas.drag) {
    let deltaX = e.x - canvas.drag.x,
        deltaY = e.y - canvas.drag.y;

    canvas.drag.x = e.x;
    canvas.drag.y = e.y;

    console.log(`MOVING { x: ${deltaX}, y: ${deltaY} }`);
    canvas.ctx.translate(deltaX, deltaY);
    console.log(`> offsetX ${e.offsetX}`);
    console.log(`> offsetY ${e.offsetY}`);
    canvas.redraw();
  }
});

canvas.el.addEventListener("mouseup", function(e) {
  canvas.drag = undefined;
  console.log(`DRAG END { x: ${e.x}, y: ${e.y} }`);
});
