class Canvas {
  constructor() {
    let el = document.createElement("canvas"),
        viewportSize = utils.getViewportSize();

    el.id = "mainCanvas";
    el.width = viewportSize.width;
    el.height = viewportSize.height;
    document.querySelector('#content').appendChild(el);

    this.el = el;
    this.context = this.el.getContext("2d");
  }

  sayHello() {
    console.log("Imma canvas!");
    console.log(this.el);
  }

  drawGrid() {
    let width = this.el.clientWidth,
        height = this.el.clientHeight;


  }
}
