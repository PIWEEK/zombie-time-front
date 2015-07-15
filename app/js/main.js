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
