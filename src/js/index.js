global.THREE = require('three');

import 'bootstrap';
import '../scss/index.scss';
import WEBGL from './utils/WebGL';

import Application from './app';

// wrap everything inside a function scope and invoke it (IIFE, a.k.a. SEAF)
(() => {
  window.addEventListener('load', () => {
    if (WEBGL.isWebGLAvailable()) {
      const app = new Application({
        container: document.getElementById('canvas-container'),
      });
      app.draw();
      app.start();

    } else {
      const warning = WEBGL.getWebGLErrorMessage();
      this.container.appendChild(warning);
    }
  });
})();
