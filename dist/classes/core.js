'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require('core-js');

var _require = require('./../config'),
    assets = _require.assets,
    coreConfig = _require.coreConfig;

var Core = function () {
  function Core() {
    _classCallCheck(this, Core);

    this.time = 0;
    this.fps = coreConfig.FPS;
    this.tickEncounter = coreConfig.TICK_ENCOUNTER;
    this.tickEncounterNominal = coreConfig.TICK_ENCOUNTER;
    this.assets = null;
    this.updateHandler = null;
    this.stage = null;

    self = this;
    $('#increased_speed').click(function () {
      $('#regular_speed').addClass('green');
      $(this).removeClass('green');
      self.tickEncounterNominal = Math.floor(coreConfig.TICK_ENCOUNTER / 2);
    });

    $('#regular_speed').click(function () {
      $('#increased_speed').addClass('green');
      $(this).removeClass('green');
      self.tickEncounterNominal = coreConfig.TICK_ENCOUNTER;
    });
  }

  _createClass(Core, [{
    key: '_loadAssets',
    value: function _loadAssets(resolver) {
      var _this = this;

      var queue = new createjs.LoadQueue();

      queue.loadManifest(assets);
      queue.on('complete', function () {
        _this.assets = queue;
        _this.init(resolver);
      }, this);
    }
  }, {
    key: 'init',
    value: function init(outerResolver) {
      var _this2 = this;

      if (outerResolver) {
        createjs.Ticker.setFPS(this.fps);
        outerResolver();
      }

      return new Promise(function (resolve) {
        if (_this2.assets === null) {
          _this2._loadAssets(resolve);
          return;
        }
      });
    }
  }, {
    key: 'run',
    value: function run(stage) {
      this.stage = stage;

      if (this.stage.core === null) {
        this.stage.init(this);
      }

      this.updateHandler = this.update.bind(this);
      createjs.Ticker.addEventListener('tick', this.updateHandler);
      this.stage.start();
    }
  }, {
    key: 'update',
    value: function update() {
      this.time += 1000 / this.fps;
      this.tickEncounter -= 1;
      this.stage.update(this.time);

      if (this.tickEncounter <= 0) {
        this.stage.tick(this.time);
        this.tickEncounter = this.tickEncounterNominal;
      }
    }
  }]);

  return Core;
}();

;

module.exports = new Core();