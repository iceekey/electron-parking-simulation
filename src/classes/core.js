require('core-js');
let {assets, coreConfig} = require('./../config');

class Core {

  constructor() {
    this.time = 0;
    this.fps = coreConfig.FPS;
    this.tickEncounter = coreConfig.TICK_ENCOUNTER;
    this.tickEncounterNominal = coreConfig.TICK_ENCOUNTER;
    this.assets = null;
    this.updateHandler = null;
    this.stage = null;

    self = this;
    $('#increased_speed').click(function() {
      $('#regular_speed').addClass('green');
      $(this).removeClass('green');
      self.tickEncounterNominal = Math.floor(coreConfig.TICK_ENCOUNTER / 2);
    });

    $('#regular_speed').click(function() {
      $('#increased_speed').addClass('green');
      $(this).removeClass('green');
      self.tickEncounterNominal = coreConfig.TICK_ENCOUNTER;
    });
  }

  _loadAssets(resolver) {
    let queue = new createjs.LoadQueue();

    queue.loadManifest(assets);
    queue.on('complete', () => {
      this.assets = queue;
      this.init(resolver);
    }, this);

  }

  init(outerResolver) {
    if (outerResolver) {
      createjs.Ticker.setFPS(this.fps);
      outerResolver();
    }

    return new Promise(resolve => {
      if (this.assets === null) {
        this._loadAssets(resolve);
        return;
      }
    });
  }

  run(stage) {
    this.stage = stage;

    if (this.stage.core === null) {
      this.stage.init(this);
    }

    this.updateHandler = this.update.bind(this);
    createjs.Ticker.addEventListener('tick', this.updateHandler);
    this.stage.start();
  }

  update() {
    this.time += 1000 / this.fps;
    this.tickEncounter -= 1;
    this.stage.update(this.time);

    if (this.tickEncounter <= 0) {
      this.stage.tick(this.time);
      this.tickEncounter = this.tickEncounterNominal;
    }
  }
};

module.exports = new Core();