import * as THREE from 'three';
import AbstractCanvasTexture from "./AbstractCanvasTexture";


export default class NebulaTexture extends AbstractCanvasTexture {

  constructor() {
    super("nebulaeCanvas", 512, "200px");
  }

  // Implement
  generateTexture(props) {
    let h = this.randRange(0.0, 1.0);
    let s = this.randRange(0.2, 0.8);
    let l = this.randRange(0.2, 0.6);
    this.baseColor = new THREE.Color().setHSL(h, s, l);
    this.colorAngle = this.randRange(0.0, 0.5);

    this.fillBaseColor();
    this.drawShapes();

    this.texture = new THREE.CanvasTexture(this.canvas);
  }

  visibleCanvas(value) {
    if (value) {
      this.canvas.style.display = "block";
    } else {
      this.canvas.style.display = "none";
    }
  }

  fillBaseColor() {
    this.ctx.fillStyle = this.toCanvasColor(this.baseColor);
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawShapes() {
    let numCircles = Math.round(this.randRange(20, 70));
    for (let i = 0; i < numCircles; ++i) {
      this.randomGradientCircle();
    }
  }

  randomGradientCircle() {
    let x1 = this.randRange(0, this.width);
    let y1 = this.randRange(0, this.height);
    let size = this.randRange(100, 200);
    let x2 = x1;
    let y2 = y1;
    let r1 = 0;
    let r2 = size;

    let gradient = this.ctx.createRadialGradient(x1, y1, r1, x2, y2, r2);

    let c = this.randomColor();
    gradient.addColorStop(0, "rgba(" + c.r + ", " + c.g + ", " + c.b + ", 1.0)");
    gradient.addColorStop(1, "rgba(" + c.r + ", " + c.g + ", " + c.b + ", 0.0)");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }


  randomColor() {
    let newColor = this.baseColor.clone();

    let hOffset = 0.0;
    let range = 0.1;
    let n = this.randRange(0, 1);
    if (n < 0.33) {
      hOffset = 0.0 + this.randRange(-range, range);
    } else if (n < 0.66) {
      hOffset = this.colorAngle + this.randRange(-range, range);
    } else {
      hOffset = -this.colorAngle + this.randRange(-range, range);
    }

    let sOffset = this.randRange(-0.4, 0.2);
    let lOffset = this.randRange(-0.4, 0.2);

    newColor.offsetHSL(hOffset, sOffset, lOffset);

    return {
      r: Math.round(newColor.r * 255),
      g: Math.round(newColor.g * 255),
      b: Math.round(newColor.b * 255)
    };
  }
}

