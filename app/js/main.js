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
