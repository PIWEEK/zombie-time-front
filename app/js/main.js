/*global $, Canvas, Promise, Mousetrap */



/**********************************************
 * Test
 **********************************************/
let imageSrc = "/assets/imgs/tile.png",
    game = new Game();

game.initialize({});

/**********************************************
 * Keybindings
 **********************************************/
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


/**********************************************
 * Click
 **********************************************/
let detailChar = document.querySelector('#detail-character');
let survivors = ['pablo', 'yami', 'miguel', 'laura', 'xenia', 'alex'];
for (let i in survivors) {
  let s = survivors[i];
  document.querySelector(`li.${s}`).addEventListener("click", function (e) {
    detailChar.className = `detail ${s}`;
    $(detailChar).find('p').hide();
    $(detailChar).find(`p.${s}`).show();
    $(detailChar).find('#want').show();
  });
}
