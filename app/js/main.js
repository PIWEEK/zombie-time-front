/*global $, Canvas, Promise, Mousetrap */

/**********************************************
 * Test
 **********************************************/
let imageSrc = "/assets/imgs/tile.png",
    game = new Game();

/**********************************************
 * Keybindings
 **********************************************/
Mousetrap.bind('h', function() {
  $('#help').show();
}, 'keydown');

Mousetrap.bind('h', function() {
  $('#help').hide();
}, 'keyup');

Mousetrap.bind('3 1 4 w e e k', function() {
  game.canvas.zombieTime = true;
  console.log('--------------------------------------');
  console.log(" >> IT'S ZOMBIE TIME!!");
  console.log('--------------------------------------');
  game.canvas.redraw();
  document.querySelector('#zt-audio').play();
});

Mousetrap.bind('3 1 4 e n d', function() {
  game.canvas.zombieTime = false;
  console.log('--------------------------------------');
  console.log(" >> ZOMBIE TIME IS OVER");
  console.log('--------------------------------------');
  game.canvas.redraw();
});



/**********************************************
 * Click
 **********************************************/
let close = document.querySelector('#close-lb');
close.addEventListener("click", function (e) {
    game.lightbox.hideAll();
});

let goals = document.querySelector('#top-left-interface');
goals.addEventListener("click", function (e) {
    game.lightbox.hideAll();
    game.lightbox.show('#goals');
});

let want = document.querySelector('#find-item .want');
want.addEventListener("click", function (e) {
    game.getItem();
});
