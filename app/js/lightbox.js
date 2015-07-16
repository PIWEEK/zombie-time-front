class Lightbox {
  constructor() {
    this.lb = document.querySelector(".lightbox");
    this.lbs = document.querySelectorAll('.inner-lb');
    this.close = document.querySelector('#close-lb');
  }

  hideAll() {
    let hideFn = (el) => el.style.display = "none";
    R.forEach(hideFn, R.concat(this.lbs, R.concat([this.lb], [this.close])));
  }

  show(id) {
    this.lb.style.display = "block";
    this.close.style.display = "block";
    document.querySelector(`${id}`).style.display = "block";
  }
}
