class Canvas {
  constructor() {
    let el = document.createElement("canvas");
    el.id = "mainCanvas";
    document.querySelector('#content').appendChild(el);
    this.el = el;
    this.context = this.el.getContext("2d");

    this.resize();
  }

  resize() {
    let viewportSize = utils.getViewportSize(),
        el = this.el;

    el.width = viewportSize.width;
    el.height = viewportSize.height;
  }

  sayHello() {
    this.context.fillStyle = "#FF000";
    console.log("Imma canvas!");
    console.log(this.el);
  }

  drawGrid() {
    let width = this.el.clientWidth,
        height = this.el.clientHeight;


  }
}
