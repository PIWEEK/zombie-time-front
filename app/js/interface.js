class Interface {
  constructor() {
    this.els = document.querySelectorAll(".interface");
    this.clock = document.querySelector("#top-right-interface.clock");
    this.currentAction = undefined;

    this.registerEvents();
    this.registerEventHandlers();
  }

  hide() {
    let hideFn = (el) => el.style.display = "none";

    R.forEach(hideFn, this.els);
  }

  show() {
    let hideFn = (el) => el.style.display = "block";

    R.forEach(hideFn, this.els);
  }

  registerEvents() {
    let w = $(window),
        menuElements = [
          ["#user-profile.menu-element", "showProfile"],
          ["#inventory.menu-element", "showInventory"],
          ["#search-button.menu-element", "search"],
          ["#move-button.menu-element", "move"],
          ["#attack-button.menu-element", "attack"],
          ["#chat-button.menu-element", "chat"]
        ],
        addClickListener = (el) => {
          document.querySelector(R.head(el)).addEventListener("click", () => {
            w.trigger("buttonClick.interface.zt", R.last(el));
          });
        };

    R.map(addClickListener, menuElements);
  }

  registerEventHandlers() {
    let w = $(window),
        onButtonClick = (e, action) => {
          console.log(` > Me clickan la acción ${action}`);
          this.currentAction = action;
        };

    w.on("buttonClick.interface.zt", onButtonClick);
  }
}
