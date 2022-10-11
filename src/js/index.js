global.THREE = require('three');

import 'bootstrap';
import '../scss/index.scss';
import WEBGL from './utils/WebGL';
//import Main from './main/mainVR'
//import Main from './main/mainWagner'
import Main from './main/main'

// wrap everything inside a function scope and invoke it (IIFE, a.k.a. SEAF)
// Immediately-Invoked Function Expression or Self-Executing Anonymous Functions
(() => {
  window.addEventListener('load', () => {
    const opts = {
      container: document.getElementById('canvas-container'),
    };
    if (opts.container === null) {
      const div = document.createElement('div');
      div.setAttribute('class', 'container');
      div.setAttribute('id', 'canvas-container');
      document.body.appendChild(div);
      opts.container = div;
    }

    if (WEBGL.isWebGLAvailable()) {
      const app = new Main(opts);
      app.init();
      app.animate();
    } else {
      opts.container.appendChild(WEBGL.getWebGLErrorMessage());
    }
  });
})();
