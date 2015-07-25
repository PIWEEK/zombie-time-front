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
let survivors = ['pablo', 'yami', 'miguel', 'laura', 'xenia', 'alex'];
let detailChar = document.querySelector('#detail-character');
for (let i in survivors) {
  let s = survivors[i];
  document.querySelector(`li.${s}`).addEventListener("click", function (e) {
    $(detailChar).find('.detail').hide();
    $(detailChar).find(`.detail.${s}`).show();
    $(detailChar).find('.want.leader').show();
    $(detailChar).find('.want.follower').show();
    $(detailChar).find('.ready').show();
  });
}

let wantLeader = document.querySelector('.want.leader');
wantLeader.addEventListener("click", function (e) {
    let survivor = document.querySelector('.detail[style*="display: block"]');
    game.stomp.sendMessage('SELECT_SURVIVOR', {leader: 'true', survivor: survivor.id});
});

let wantFollower = document.querySelector('.want.follower');
wantFollower.addEventListener("click", function (e) {
    let survivor = document.querySelector('.detail[style*="display: block"]');
    game.stomp.sendMessage('SELECT_SURVIVOR', {leader: 'false', survivor: survivor.id });
});

let ready = document.querySelector('.ready');
ready.addEventListener("click", function (e) {
    game.stomp.sendMessage('PLAYER_READY', {});
});

let close = document.querySelector('#close-lb');
close.addEventListener("click", function (e) {
    game.lightbox.hideAll();
});

let goals = document.querySelector('#top-left-interface');
goals.addEventListener("click", function (e) {
    game.lightbox.show('#goals');
});

let want = document.querySelector('#find-item .want');
want.addEventListener("click", function (e) {
    game.getItem();
});
