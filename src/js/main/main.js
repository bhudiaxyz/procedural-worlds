import WAGNER from '@superguigui/wagner'
import MultiPassBloomPass from '@superguigui/wagner/src/passes/bloom/MultiPassBloomPass'
import GodrayPass from '@superguigui/wagner/src/passes/godray/godraypass'
import seedrandom from "seedrandom";
import randomLorem from "random-lorem";

import AbstractApplication from '../views/AbstractApplication'
import Planet from '../scene/Planet'
import Stars from "../scene/Stars";
import Nebula from "../scene/Nebula";
import Sun from "../scene/Sun";


class Main extends AbstractApplication {

  constructor(opts = {}) {
    super(opts);

    this.seedString = "Scarlett";
    this.initSeed();

    this.resolution = 1024;
    this.autoGenerate = false;
    this.autoGenCountCurrent = 0;
    this.autoGenTime = 3 * 60;
    this.autoGenCountMax = this.autoGenTime * 60;

    this.createControls();

    this.nebula = new Nebula();
    this.scene.add(this.nebula);

    this.stars = new Stars();
    this.scene.add(this.stars);

    this.sun = new Sun();
    this.scene.add(this.sun);

    this.planet = new Planet();
    this.scene.add(this.planet);

    this.initPostprocessing();
    this.setupControlsUI();

    this.initFromURL();
  }


  createControls() {
    let spaceFolder = window.gui.addFolder('Space');

    spaceFolder.add(this, "resolution", [256, 512, 1024, 2048, 4096]).onChange(value => {
      this.regenerate();
    });

    spaceFolder.add(this, "autoGenerate");
    spaceFolder.add(this, "autoGenTime", 30, 300).step(1).onChange(value => {
      this.autoGenCountMax = this.autoGenTime * 60
    });


    this.seedStringControl = spaceFolder.add(this, "seedString").listen();
    this.seedStringControl.onFinishChange(value => {
      this.loadSeedFromTextfield();
    });

    document.addEventListener('keydown', (event) => {
      if (event.keyCode == 32) {
        this.randomize();
      }
    });

    window.onpopstate = (event) => {
      this.initFromURL();
    };
  }


  initPostprocessing() {
    this.renderer.autoClearColor = true;
    this.bloom = false;
    this.composer = new WAGNER.Composer(this._renderer);
    this.bloomPass = new MultiPassBloomPass({
      blurAmount: 3,
      applyZoomBlur: true
    });
    this.godrayPass = new GodrayPass();

    let postProcessFolder = window.gui.addFolder("Post Processing");
    postProcessFolder.add(this, "bloom");
    postProcessFolder.add(this.bloomPass.params, "blurAmount", 0, 5);
  }

  updateQueryString(key, value, url) {
    if (!url) url = window.location.href;
    var re = new RegExp("([?&])" + key + "=.*?(&|#|$)(.*)", "gi"),
      hash;

    if (re.test(url)) {
      if (typeof value !== 'undefined' && value !== null)
        return url.replace(re, '$1' + key + "=" + value + '$2$3');
      else {
        hash = url.split('#');
        url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
        if (typeof hash[1] !== 'undefined' && hash[1] !== null)
          url += '#' + hash[1];
        return url;
      }
    } else {
      if (typeof value !== 'undefined' && value !== null) {
        var separator = url.indexOf('?') !== -1 ? '&' : '?';
        hash = url.split('#');
        url = hash[0] + separator + key + '=' + value;
        if (typeof hash[1] !== 'undefined' && hash[1] !== null)
          url += '#' + hash[1];
        return url;
      } else
        return url;
    }
  }

  getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  initSeed() {
    window.seedString = this.seedString;
    window.rng = seedrandom(this.seedString);
  }

  initFromURL() {
    this.seedString = this.getParameterByName("seed");
    if (this.seedString) {
      console.log("Using seed string: " + this.seedString);
      this.regenerate();
    } else {
      console.log("No seed string - using random");
      this.randomize();
    }
  }

  loadSeedFromTextfield() {
    let url = this.updateQueryString("seed", this.seedString);
    window.history.pushState({seed: this.seedString}, this.seedString, url);
    this.regenerate();
  }

  regenerate() {
    this.autoGenCountCurrent = 0;
    this.renderScene();
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  randomize() {
    let n = Math.random();
    let wordCount = 0;
    if (n > 0.8) {
      wordCount = 1;
    } else if (n > 0.4) {
      wordCount = 2;
    } else {
      wordCount = 3;
    }

    this.seedString = "";
    for (let i = 0; i < wordCount; i++) {
      this.seedString += this.capitalizeFirstLetter(randomLorem({min: 2, max: 8}));
      if (i < wordCount - 1) {
        this.seedString += " ";
      }
    }

    let url = this.updateQueryString("seed", this.seedString);
    window.history.pushState({seed: this.seedString}, this.seedString, url);
    this.autoGenCountCurrent = 0;
    this.renderScene();
  }

  update() {
    if (this.planet.rotate) {
      this.stars.rotation.y += 0.0004;
      this.nebula.rotation.y += 0.0003;
    }

    this.planet.update();

    if (this.autoGenerate) {
      this.autoGenCountCurrent++;
      if (this.autoGenCountCurrent > this.autoGenCountMax) {
        this.randomize();
      }
    }

    this.stars.position.copy(window.camera.position);
    this.nebula.position.copy(window.camera.position);
  }

  renderScene() {
    this.initSeed();
    this.updateWorldName();

    this.stars.resolution = this.resolution;
    this.nebula.resolution = this.resolution;

    window.renderQueue.start();

    this.nebula.generateTexture();
    this.stars.render({nebulaeMap: this.nebula.nebulaeGradient.texture});
    this.nebula.render();
    this.sun.render();

    this.planet.renderScene();
  }

  setupControlsUI() {
    let infoBoxHolder = document.createElement("div");
    infoBoxHolder.setAttribute("id", "infoBoxHolder");
    document.body.appendChild(infoBoxHolder);

    // New world button
    let newPlanetButtonHolder = document.createElement("div");
    newPlanetButtonHolder.setAttribute("id", "newPlanetButtonHolder");
    newPlanetButtonHolder.setAttribute("class", "text-center");
    newPlanetButtonHolder.innerHTML = "<button id='newPlanetButton' class='btn btn-primary'>New</button>";
    infoBoxHolder.appendChild(newPlanetButtonHolder);

    let newPlanetButton = document.getElementById("newPlanetButton");
    newPlanetButton.addEventListener('click', (e) => {
      this.randomize()
    });

    // World info + help
    let infoBox = document.createElement("div");
    infoBox.setAttribute("id", "infoBox");
    infoBox.innerHTML = "World<br><div id='planetName'></div><br><div id='instructions'>H - Show/Hide UI<br>SPACEBAR - New Planet</div>";
    infoBoxHolder.appendChild(infoBox);

    let line = document.createElement("div");
    line.setAttribute("id", "line");
    infoBoxHolder.appendChild(line);

    infoBoxHolder.appendChild(window.gui.domElement);

    this.updateWorldName();

    window.gui.add(this, "randomize");
  }

  updateWorldName() {
    let planetName = document.getElementById("planetName");
    if (planetName != null) {
      planetName.innerHTML = this.seedString;
    }
  }


  animate() {
    super.animate();

    window.renderQueue.update();
    this.update();

    if (this.bloom) {
      this.composer.reset();
      this.composer.render(this.scene, this.camera);
      this.composer.pass(this.bloomPass);
      this.composer.pass(this.godrayPass);
      this.composer.toScreen();
    }
  }

}

export default Main;
