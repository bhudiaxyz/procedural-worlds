import * as THREE from 'three';
import AbstractCanvasTexture from "./AbstractCanvasTexture";


export default class BiomeTexture extends AbstractCanvasTexture {

  constructor() {
    super("biomeCanvas", 512, "200px");
  }

  // Implement
  generateTexture(props) {
    this.waterLevel = props.waterLevel;

    let h = this.randRange(0.0, 1.0);
    let s = this.randRange(0.0, 0.7);
    let l = this.randRange(0.0, 0.6);
    this.baseColor = new THREE.Color().setHSL(h, s, l);
    this.colorAngle = this.randRange(0.2, 0.4)
    this.saturationRange = this.randRange(0.3, 0.5);
    this.lightnessRange = this.randRange(0.3, 0.5);
    this.circleSize = this.randRange(30, 250);

    // this.blackWhiteGradient();
    this.drawBase();
    this.drawCircles();
    this.drawDetail();
    this.drawInland();
    this.drawBeach();
    this.drawWater();

    this.texture = new THREE.CanvasTexture(this.canvas);
  }

  drawCircles() {
    let numCircles = Math.round(this.randRange(50, 150));
    for (let i = 0; i < numCircles; ++i) {
      this.randomGradientCircle();
    }
  }

  drawBase() {
    this.fillBaseColor();

    let baseDetail = Math.round(this.randRange(5, 20));
    for (let i = 0; i < baseDetail; ++i) {
      let x1 = this.randRange(0, this.width);
      let y1 = this.randRange(0, this.height);
      let x2 = this.randRange(0, this.width);
      let y2 = this.randRange(0, this.height);
      let width = Math.abs(x2 - x1);
      let height = Math.abs(y2 - y1);

      this.randomGradientRect(0, 0, this.width, this.height);
      this.randomGradientRect(x1, y1, width, height);
    }
  }

  drawDetail() {
    let landDetail = Math.round(this.randRange(5, 45));
    for (let i = 0; i < landDetail; ++i) {
      let x1 = this.randRange(0, this.width);
      let y1 = this.randRange(0, this.height);
      let x2 = this.randRange(0, this.width);
      let y2 = this.randRange(0, this.height);
      let width = Math.abs(x2 - x1);
      let height = Math.abs(y2 - y1);

      this.randomGradientStrip(0, 0, this.width, this.height);
      this.randomGradientStrip(x1, y1, width, height);
    }
  }

  drawRivers() {
    let c = this.randomColor();
    this.ctx.strokeStyle = "rgba(" + c.r + ", " + c.g + ", " + c.b + ", 0.5)";

    let x = this.randRange(0, this.width);
    let y = this.randRange(0, this.height);
    let prevX = x;
    let prevY = y;

    let riverDetail = Math.round(this.randRange(15, 75));
    for (let i = 0; i < riverDetail; ++i) {
      x = this.randRange(0, this.width);
      y = this.randRange(0, this.height);

      this.ctx.moveTo(prevX, prevY);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();

      prevX = x;
      prevY = y;
    }
  }

  randomCircle() {
    let x = this.randRange(0, this.width);
    let y = this.randRange(0, this.height);
    let rad = this.randRange(2, 15);

    let c = this.randomColor();
    this.ctx.fillStyle = "rgba(" + c.r + ", " + c.g + ", " + c.b + ", 0.5)";

    this.ctx.beginPath();
    this.ctx.arc(x, y, rad, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  randomGradientStrip(x, y, width, height) {
    let x1 = this.randRange(0, this.width);
    let y1 = this.randRange(0, this.height);
    let x2 = this.randRange(0, this.width);
    let y2 = this.randRange(0, this.height);

    let gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);

    let c = this.randomColor();
    gradient.addColorStop(this.randRange(0, 0.5), "rgba(" + c.r + ", " + c.g + ", " + c.b + ", 0.0)");
    gradient.addColorStop(0.5, "rgba(" + c.r + ", " + c.g + ", " + c.b + ", 0.8)");
    gradient.addColorStop(this.randRange(0.5, 1.0), "rgba(" + c.r + ", " + c.g + ", " + c.b + ", 0.0)");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, width, height);
  }

  blackWhiteGradient() {
    let x1 = 0;
    let y1 = 0;
    let x2 = this.width;
    let y2 = this.height;

    let gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);

    gradient.addColorStop(0, "rgba(255, 255, 255, 1.0)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 1.0)");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  fillBaseColor() {
    this.ctx.fillStyle = this.toCanvasColor(this.baseColor);
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  randomGradientRect(x, y, width, height) {
    let x1 = this.randRange(0, this.width);
    let y1 = this.randRange(0, this.height);
    let x2 = this.randRange(0, this.width);
    let y2 = this.randRange(0, this.height);

    let gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);

    let c = this.randomColor();
    gradient.addColorStop(0, "rgba(" + c.r + ", " + c.g + ", " + c.b + ", 0.0)");
    gradient.addColorStop(1, "rgba(" + c.r + ", " + c.g + ", " + c.b + ", 1.0)");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, width, height);
  }

  drawWater() {
    let x1 = 0;
    let y1 = this.height - (this.height * this.waterLevel);
    let x2 = 0;
    let y2 = this.height;

    let gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);

    let c = this.randomWaterColor();
    let falloff = 1.3;
    let falloff2 = 1.0;
    let falloff3 = 0.7;
    let opacity = 0.9;
    // gradient.addColorStop(0.0, "rgba("+cr+", "+cg+", "+cb+", "+0+")");
    gradient.addColorStop(0.0, "rgba(" + Math.round(c.r * falloff) + ", " + Math.round(c.g * falloff) + ", " + Math.round(c.b * falloff) + ", " + opacity + ")");
    gradient.addColorStop(0.2, "rgba(" + Math.round(c.r * falloff2) + ", " + Math.round(c.g * falloff2) + ", " + Math.round(c.b * falloff2) + ", " + opacity + ")");
    gradient.addColorStop(0.8, "rgba(" + Math.round(c.r * falloff3) + ", " + Math.round(c.g * falloff3) + ", " + Math.round(c.b * falloff3) + ", " + opacity + ")");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x1, y1, this.width, this.height);
  }

  drawBeach() {
    let beachSize = Math.round(this.randRange(5, 12));

    let x1 = 0;
    let y1 = this.height - (this.height * this.waterLevel) - beachSize;
    let x2 = 0;
    let y2 = this.height - (this.height * this.waterLevel);

    let gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);

    let c = this.randomColor();
    let falloff = 1.0;
    let falloff2 = 1.0;
    // gradient.addColorStop(0.0, "rgba("+cr+", "+cg+", "+cb+", "+0+")");
    gradient.addColorStop(0.0, "rgba(" + Math.round(c.r * falloff) + ", " + Math.round(c.g * falloff) + ", " + Math.round(c.b * falloff) + ", " + 0.0 + ")");
    gradient.addColorStop(1.0, "rgba(" + Math.round(c.r * falloff2) + ", " + Math.round(c.g * falloff2) + ", " + Math.round(c.b * falloff2) + ", " + 0.3 + ")");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x1, y1, this.width, beachSize);
  }

  drawInland() {
    let inlandSize = Math.round(this.randRange(75, 125));

    let x1 = 0;
    let y1 = this.height - (this.height * this.waterLevel) - inlandSize;
    let x2 = 0;
    let y2 = this.height - (this.height * this.waterLevel);

    let gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);

    let c = this.randomColor();
    let falloff = 1.0;
    let falloff2 = 1.0;
    // gradient.addColorStop(0.0, "rgba("+cr+", "+cg+", "+cb+", "+0+")");
    gradient.addColorStop(0.0, "rgba(" + Math.round(c.r * falloff) + ", " + Math.round(c.g * falloff) + ", " + Math.round(c.b * falloff) + ", " + 0.0 + ")");
    gradient.addColorStop(1.0, "rgba(" + Math.round(c.r * falloff2) + ", " + Math.round(c.g * falloff2) + ", " + Math.round(c.b * falloff2) + ", " + 0.5 + ")");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x1, y1, this.width, inlandSize);
  }

  randomGradientCircle() {
    let x1 = this.randRange(0, this.width);
    let y1 = this.randRange(0, this.height) - this.height * this.waterLevel;
    let size = this.randRange(10, this.circleSize);
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

  randomWaterColor() {
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

    // let sOffset = this.randRange(-this.satRange, this.satRange);
    // let lOffset = this.randRange(-this.lightRange, this.lightRange);

    let c = newColor.getHSL();
    c.h += hOffset;
    c.s = this.randRange(0.0, 0.6);
    c.l = this.randRange(0.1, 0.4);

    newColor.setHSL(c.h, c.s, c.l);
    // newColor.offsetHSL(hOffset, sOffset, lOffset);

    return {
      r: Math.round(newColor.r * 255),
      g: Math.round(newColor.g * 255),
      b: Math.round(newColor.b * 255)
    };
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

    let sOffset = this.randRange(-this.saturationRange, this.saturationRange);
    let lOffset = this.randRange(-this.lightnessRange, this.lightnessRange);

    let c = newColor.getHSL();
    c.h += hOffset;
    c.s += sOffset;
    c.l += lOffset;
    if (c.l < 0) {
      c.l = Math.abs(c.l) * 0.3;
    }
    // if (c.l > 0.7) {
    //   let diff = c.l - 0.7;
    //   c.l = 0.7 - diff;
    // }

    // c.s = this.randRange(0.0, 0.7);
    // c.l = this.randRange(0.0, 1.0);

    newColor.setHSL(c.h, c.s, c.l);

    // newColor.offsetHSL(hOffset, sOffset, lOffset);

    return {
      r: Math.round(newColor.r * 255),
      g: Math.round(newColor.g * 255),
      b: Math.round(newColor.b * 255)
    };

  }

  // randomColor() {
  //
  //   let newColor = this.baseColor.clone();
  //
  //   let hOffset = 0.0;
  //   let range = 0.1;
  //   let n = this.randRange(0,1);
  //   if (n < 0.33) {
  //     hOffset = 0.0 + this.randRange(-range, range);
  //   } else if (n < 0.66) {
  //     hOffset = this.colorAngle + this.randRange(-range, range);
  //   } else {
  //     hOffset = -this.colorAngle + this.randRange(-range, range);
  //   }
  //
  //   newColor.offsetHSL(hOffset, 0, 0);
  //   let c = newColor.getHSL();
  //   newColor.setHSL(c.h, this.randRange(0.0, 0.8), this.randRange(0.0, 0.6));
  //
  //   return {r: Math.round(newColor.r*255),
  //           g: Math.round(newColor.g*255),
  //           b: Math.round(newColor.b*255)};
  //
  // }
}
