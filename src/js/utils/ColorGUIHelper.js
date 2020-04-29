export default class ColorGUIHelper {

  constructor(object, prop) {
    this.object = object;
    this.prop = prop;
  }

  get color() {
    return `#${this.object[this.prop].getHexString()}`;
  }

  set color(hexString) {
    this.object[this.prop].set(hexString);
  }
}
