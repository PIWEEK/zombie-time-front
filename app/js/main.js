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
  });
}

let wantLeader = document.querySelector('.want.leader');
wantLeader.addEventListener("click", function (e) {
    alert('te lo pides de líder');
});

let wantFollower = document.querySelector('.want.follower');
wantFollower.addEventListener("click", function (e) {
    alert('te lo pides de seguidor');
});
