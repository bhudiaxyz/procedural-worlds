import * as THREE from 'three';


export default class AbstractCanvasTexture {

  constructor(id, size, styleSize = "200px", tagName = "canvas") {

    this.canvas = document.createElement(tagName);
    this.canvas.id = id;
    this.canvas.width = size;
    this.canvas.height = size;
    this.canvas.style.width = styleSize;
    this.canvas.style.height = styleSize;
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.ctx = this.canvas.getContext("2d");
    this.texture = new THREE.CanvasTexture(this.canvas);

    document.body.appendChild(this.canvas);
    this.visibleCanvas(false);
  }

  generateTexture(props) {
    // Abstract
  }

  visibleCanvas(value) {
    if (value) {
      this.canvas.style.display = "block";
    } else {
      this.canvas.style.display = "none";
    }
  }

  clear(fillColor = "#000000") {
    this.ctx.fillStyle = fillColor;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  toCanvasColor(c) {
    return "rgba(" + Math.round(c.r * 255) + ", " + Math.round(c.g * 255) + ", " + Math.round(c.b * 255) + ", 1.0)";
  }

  randRange(low, high) {
    let range = high - low;
    let n = window.rng() * range;
    return low + n;
  }

  mix(v1, v2, amount) {
    let dist = v2 - v1;
    return v1 + (dist * amount);
  }
}
