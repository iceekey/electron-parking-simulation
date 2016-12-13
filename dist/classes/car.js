'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('./../config'),
    carColors = _require.carColors,
    carRect = _require.carRect,
    grid = _require.grid,
    groundRect = _require.groundRect,
    coreConfig = _require.coreConfig;

var StageBehaviourObject = require('./stage-behaviour-object');

var _ = require('lodash');

var CAR_TYPES_COUNT = 8;
var CAR_FRAMES_COUNT = 8;

module.exports = function (_StageBehaviourObject) {
  _inherits(Car, _StageBehaviourObject);

  function Car(stage, x, y) {
    _classCallCheck(this, Car);

    var _this = _possibleConstructorReturn(this, (Car.__proto__ || Object.getPrototypeOf(Car)).call(this, stage));

    var color = carColors[Math.floor(carColors.length * Math.random())];
    var type = Math.floor(CAR_TYPES_COUNT * Math.random());

    var data = {
      images: [stage.core.assets.getResult('CARS_' + color.toUpperCase())],
      frames: {
        width: carRect.width,
        height: carRect.height,
        count: CAR_TYPES_COUNT * CAR_FRAMES_COUNT,
        spacing: 0,
        margin: 0,
        regX: carRect.width / 2,
        regY: carRect.height / 2
      },
      animations: {
        westSouth: type * CAR_FRAMES_COUNT,
        eastNorth: type * CAR_FRAMES_COUNT + 4,
        westNorth: type * CAR_FRAMES_COUNT + 2,
        eastSouth: type * CAR_FRAMES_COUNT + 6
      }
    };

    _this.x = _this.targetX = x;
    _this.y = _this.targetY = y;

    var shift = _this.stage.ground.getShift(_this.x, _this.y);
    _this.dx = shift.dx;
    _this.dy = shift.dy;

    _this.vx = 0;
    _this.vy = 0;

    _this.path = [];
    _this.step = 0;

    _this.sheet = new createjs.SpriteSheet(data);
    _this.sprite = new createjs.Sprite(_this.sheet, 'eastSouth');

    _this.sprite.scaleX = 1;
    _this.sprite.scaleY = 1;

    _this.alpha = 0;
    _this.parked = false;

    _this.deleted = false;
    _this.onRemove = null;
    _this.onRemoveResolver = null;
    return _this;
  }

  _createClass(Car, [{
    key: 'setPath',
    value: function setPath(path) {
      if (_.isArray(path)) {
        this.path = path;
        this.step = 0;
      }
    }
  }, {
    key: 'next',
    value: function next() {
      var _this2 = this;

      var pathChunk = this.path[this.step];
      var ground = this.stage.ground;

      if (_.isArray(pathChunk)) {
        var x = pathChunk[0],
            y = pathChunk[1];
        if (ground.isExit(x, y)) {
          this.onRemove = new Promise(function (res) {
            _this2.onRemoveResolver = res;
          });
        }

        this.goto(x, y);
        this.step += 1;
        return true;
      } else {
        if (this.stage.ground.isParkingPlace(this.x, this.y)) {
          this.stage.carManager.parkingStream.next({
            action: 'PARKING',
            x: this.x,
            y: this.y
          });
          this.stage.parkingManager.park(this);
        }

        if (this.stage.ground.isExit(this.x, this.y)) {
          this.stage.draw.removeChild(this.sprite);
        }
      }

      return false;
    }
  }, {
    key: 'goto',
    value: function goto(x, y) {
      var shift = this.stage.ground.getShift(this.x, this.y);
      var targetShift = this.stage.ground.getShift(x, y);

      this.targetX = x;
      this.targetY = y;

      this.vx = (targetShift.dx - shift.dx) / this.stage.core.tickEncounterNominal;
      this.vy = (targetShift.dy - shift.dy) / this.stage.core.tickEncounterNominal;

      var directionV = x > this.x ? 'east' : 'west';
      if (x === this.x) {
        directionV = y > this.y ? 'east' : 'west';
      }

      var directionH = y > this.y ? 'South' : 'North';
      if (y === this.y) {
        directionH = x > this.x ? 'North' : 'South';
      }

      this.sprite.gotoAndStop(directionV + directionH);
    }
  }, {
    key: 'stay',
    value: function stay() {
      this.x = this.targetX;
      this.y = this.targetY;
      var shift = this.stage.ground.getShift(this.x, this.y);
      this.dx = shift.dx;
      this.dy = shift.dy;
      this.vx = 0;
      this.vy = 0;
    }
  }, {
    key: 'update',
    value: function update() {
      if (this.deleted) {
        return;
      }

      if (this.alpha < 1 && this.onRemove === null) {
        this.alpha += 0.1;
      }

      if (this.alpha > 0 && this.onRemove !== null) {
        this.alpha -= 0.1;
      }

      if (this.alpha <= 0 && this.onRemove !== null) {
        this.deleted = true;
        this.onRemoveResolver(this.forStage());
      }

      this.dx += this.vx;
      this.dy += this.vy;

      this.sprite.alpha = this.alpha;
      this.sprite.x = this.dx;
      this.sprite.y = this.dy;
    }
  }, {
    key: 'forStageRemove',
    value: function forStageRemove() {
      var _this3 = this;

      if (this.onRemove === null) {
        this.onRemove = new Promise(function (res) {
          _this3.onRemoveResolver = res;
        });
      }

      return this.onRemove;
    }
  }, {
    key: 'forStage',
    value: function forStage() {
      return this.sprite;
    }
  }, {
    key: 'width',
    get: function get() {
      return carRect.width;
    }
  }, {
    key: 'height',
    get: function get() {
      return carRect.height;
    }
  }]);

  return Car;
}(StageBehaviourObject);