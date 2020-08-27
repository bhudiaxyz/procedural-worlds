import WAGNER from '@superguigui/wagner'
import MultiPassBloomPass from '@superguigui/wagner/src/passes/bloom/MultiPassBloomPass'
import GodrayPass from '@superguigui/wagner/src/passes/godray/godraypass'
import seedrandom from "seedrandom";
import randomLorem from "random-lorem";
import * as Alea from 'alea';
import * as SimplexNoise from 'simplex-noise';

import AbstractApplication from '../views/AbstractApplication'
import Planet from '../scene/Planet'
import Stars from "../scene/Stars";
import Nebula from "../scene/Nebula";
import Sun from "../scene/Sun";
import PlanetEarth from '../scene/PlanetEarth'
import SimplePlanet from "../scene/SimplePlanet";

const N = 6;
const TWO_N = Math.pow(2, N); // detail of the spheres
const EARTH_RADIUS = 1000.0;

export default class Main extends AbstractApplication {

  constructor(opts = {}) {
    super(opts);

    this.params = {
      // seedString: "Ezrohzo Esogam",
      seedString: "Ik Esce",
      resolution: 1024,
      autoGenerate: false,
      autoGenTime: 3 * 60,
      bloom: false
    };
    this.autoGenCountCurrent = 0;
    this.autoGenCountMax = this.params.autoGenTime * 60;

    this.initSeed();
    this.createControls();
    this.setupPostprocessing();

    this.nebula = new Nebula();
    this.scene.add(this.nebula);

    this.stars = new Stars();
    this.scene.add(this.stars);

    this.sun = new Sun();
    this.scene.add(this.sun);

    this.planet = new Planet();
    // this.planet = new PlanetEarth(this.random, EARTH_RADIUS, N, TWO_N, TWO_N);
    // this.planet = new SimplePlanet(this.random, EARTH_RADIUS, N, TWO_N, TWO_N);
    this.scene.add(this.planet);

    this.setupControlsUI();
  }

  createControls() {
    let generalFolder = window.gui.addFolder('General');

    generalFolder.add(this.params, "resolution", [128, 256, 512, 1024, 2048]).onChange(value => {
      this.regenerate();
    });

    generalFolder.add(this.params, "autoGenerate");
    generalFolder.add(this.params, "autoGenTime", 30, 300).step(1).onChange(value => {
      this.autoGenCountMax = this.params.autoGenTime * 60
    });


    let seedStringControl = generalFolder.add(this.params, "seedString").listen();
    seedStringControl.onFinishChange(value => {
      this.updateUrlAndRegenerate();
    });

    document.addEventListener('keydown', (event) => {
      if (event.keyCode == 32) {
        this.randomize();
      }
    });

    window.onpopstate = (event) => {
      this.init();
    };
  }

  setupPostprocessing() {
    this.renderer.autoClearColor = true;
    this.composer = new WAGNER.Composer(this.renderer);
    this.bloomPass = new MultiPassBloomPass({
      blurAmount: 0.1,
      applyZoomBlur: true,
      zoomBlurStrength: 3.3
    });
    this.godrayPass = new GodrayPass();

    let postProcessFolder = window.gui.addFolder("Post Processing");
    postProcessFolder.add(this.params, "bloom");
    postProcessFolder.add(this.bloomPass.params, "blurAmount", 0, 5);
    postProcessFolder.add(this.bloomPass.params, "applyZoomBlur");
    postProcessFolder.add(this.bloomPass.params, "zoomBlurStrength", 0, 5);
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
    window.seedString = this.params.seedString;
    window.rng = seedrandom(this.params.seedString);

    this.random = new Alea(this.params.seedString);
    this.noise = new SimplexNoise(this.random);
  }

  // Implement
  init() {
    super.init();

    this.params.seedString = this.getParameterByName("seed");
    if (this.params.seedString) {
      console.log("Using seed string: " + this.params.seedString);
      this.regenerate();
    } else {
      console.log("No seed string - randomizing");
      this.randomize();
    }
  }

  updateUrlAndRegenerate() {
    this.autoGenCountCurrent = 0;
    let url = this.updateQueryString("seed", this.params.seedString);
    window.history.pushState({seed: this.params.seedString}, this.params.seedString, url);
    this.regenerate();
  }

  regenerate() {
    this.autoGenCountCurrent = 0;
    this.render();
  }

  generateNewSeed() {
    let n = Math.random();
    let wordCount = 0;
    if (n > 0.8) {
      wordCount = 1;
    } else if (n > 0.4) {
      wordCount = 2;
    } else {
      wordCount = 3;
    }

    let newSeedString = "";
    for (let i = 0; i < wordCount; ++i) {
      const randWord = randomLorem({min: 2, max: 8});
      const wordCapitalized = randWord.charAt(0).toUpperCase() + randWord.slice(1)
      newSeedString += wordCapitalized;
      if (i < wordCount - 1) {
        newSeedString += " ";
      }
    }
    return newSeedString;
  }

  randomize() {
    this.autoGenCountCurrent = 0;
    this.params.seedString = this.generateNewSeed();
    this.updateUrlAndRegenerate();
  }

  changeResolution() {
    // this.stars.resolution = this.params.resolution;
    // this.nebula.resolution = this.params.resolution;
    this.planet.resolution = this.params.resolution;
  }

  render() {
    this.initSeed();
    this.updateWorldName();

    window.renderQueue.start();

    this.changeResolution();
    this.nebula.render();
    this.stars.render({nebulaMap: this.nebula.nebulaTexture.texture});
    this.sun.render();
    this.planet.render();

    window.renderQueue.finish();
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
      planetName.innerHTML = this.params.seedString;
    }
  }

  // Implement
  update() {
    this.nebula.update();
    this.stars.update();
    this.sun.update();
    this.planet.update();

    if (this.params.autoGenerate) {
      this.autoGenCountCurrent++;
      if (this.autoGenCountCurrent > this.autoGenCountMax) {
        this.randomize();
      }
    }

    this.stars.position.copy(window.camera.position);
    this.nebula.position.copy(window.camera.position);

    if (this.params.bloom) {
      this.composer.reset();
      this.composer.render(this.scene, this.camera);
      this.composer.pass(this.bloomPass);
      this.composer.pass(this.godrayPass);
      this.composer.toScreen();
    }
  }
}
