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
  }
}
