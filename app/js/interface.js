class Interface {
  constructor() {
    this.els = document.querySelectorAll(".interface");
    this.clock = document.querySelector("#top-right-interface.clock");

    this.registerEvents();
  }

  hide() {
    let hideFn = (el) => el.style.display = "none";

    R.forEach(hideFn, this.els);
  }

  show() {
    let showFn = (el) => el.style.display = "block";

    R.forEach(showFn, this.els);
  }

  registerEvents() {
    let w = $(window),
        menuElements = [
          ["#user-profile.menu-element", "showProfile"],
          ["#inventory.menu-element", "showInventory"],
          ["#attack-button.menu-element", "attack"],
          ["#move-button.menu-element", "move"],
          ["#search-button.menu-element", "search"],
          ["#noise-button.menu-element", "noise"],
          ["#chat-button.menu-element", "chat"],
          ["#end-turn-button.menu-element", "endTurn"]
        ],
        addClickListener = (el) => {
          document.querySelector(R.head(el)).addEventListener("click", () => {
            w.trigger("buttonClick.interface.zt", R.last(el));
          });
        };

    R.map(addClickListener, menuElements);

    document.querySelector(".chat-form").addEventListener("submit", (e) => {
      e.preventDefault();
      w.trigger("sendChat.interface.zt");
    });

    document.querySelector("#log").addEventListener("click", () => {
      w.trigger("toggleLog.interface.zt");
    });

    document.querySelector("#choose-character .ready").addEventListener("click", () => {
      w.trigger("buttonClick.ready.zt");
    });

    document.querySelector("#music-button").addEventListener("click", () => {
      w.trigger("buttonClick.music.zt");
    });

    document.querySelector("#inventory-info").addEventListener("mouseleave", () => {
        document.querySelector("#inventory-info").style.visibility='hidden';
    });

    document.querySelector("#user-profile").addEventListener("mouseenter", () => {
        document.querySelector("#inventory-info").style.visibility='hidden';
    });

    document.querySelector("#attack-button").addEventListener("mouseenter", () => {
        document.querySelector("#inventory-info").style.visibility='hidden';
    });

    document.querySelector("#log").addEventListener("mouseenter", () => {
        document.querySelector("#inventory-info").style.visibility='hidden';
    });

    document.querySelector(".leader .team-photo").addEventListener("drop", (ev) => {
      var slug = ev.dataTransfer.getData("slug");
      w.trigger("drop.interface.zt", {"slug":slug, "leader":true});
    });

    document.querySelector(".follower .team-photo").addEventListener("drop", (ev) => {
      var slug = ev.dataTransfer.getData("slug");
      w.trigger("drop.interface.zt", {"slug":slug, "leader":false});
    });

    document.querySelector(".leader .team-photo").addEventListener("dragover", (ev) => {
      ev.preventDefault();
    });

    document.querySelector(".follower .team-photo").addEventListener("dragover", (ev) => {
      ev.preventDefault();
    });

    Mousetrap.bind('w', function() {
        w.trigger("buttonClick.interface.zt", 'moveUp');
    }, 'keydown');
    Mousetrap.bind('s', function() {
        w.trigger("buttonClick.interface.zt", 'moveDown');
    }, 'keydown');
    Mousetrap.bind('a', function() {
        w.trigger("buttonClick.interface.zt", 'moveLeft');
    }, 'keydown');
    Mousetrap.bind('d', function() {
        w.trigger("buttonClick.interface.zt", 'moveRight');
    }, 'keydown');

    Mousetrap.bind('1', function() {
        w.trigger("buttonClick.interface.zt", 'attack');
    }, 'keydown');

    Mousetrap.bind('2', function() {
        w.trigger("buttonClick.interface.zt", 'search');
    }, 'keydown');

    Mousetrap.bind('3', function() {
        w.trigger("buttonClick.interface.zt", 'noise');
    }, 'keydown');

    Mousetrap.bind('c', function() {
        w.trigger("buttonClick.interface.zt", 'chat');
    }, 'keydown');

    Mousetrap.bind('space', function() {
        w.trigger("buttonClick.interface.zt", 'endTurn');
    }, 'keydown');


  }
}
