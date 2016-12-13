'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('./../config'),
    parkingSignRect = _require.parkingSignRect;

var StageBehaviourObject = require('./stage-behaviour-object');

module.exports = function (_StageBehaviourObject) {
  _inherits(ParkingSign, _StageBehaviourObject);

  function ParkingSign(stage, x, y) {
    _classCallCheck(this, ParkingSign);

    var _this = _possibleConstructorReturn(this, (ParkingSign.__proto__ || Object.getPrototypeOf(ParkingSign)).call(this, stage));

    var data = {
      images: [stage.core.assets.getResult('PARKING_SIGN')],
      frames: {
        width: parkingSignRect.width,
        height: parkingSignRect.height,
        count: 2,
        spacing: 0,
        margin: 0,
        regX: parkingSignRect.width / 2,
        regY: parkingSignRect.height / 2
      },
      animations: {
        default: 0,
        busy: 1
      }
    };

    _this.busy = false;
    _this.Dy = 0;
    _this.Vy = 0.1;

    _this.x = x;
    _this.y = y;

    var shift = _this.stage.ground.getShift(x, y);
    _this.dx = shift.dx;
    _this.dy = shift.dy;

    _this.sheet = new createjs.SpriteSheet(data);
    _this.sprite = new createjs.Sprite(_this.sheet, 'default');

    _this.sprite.scaleX = 1;
    _this.sprite.scaleY = 1;

    _this.stage.runStream.subscribe(function () {
      _this.busy = false;
      _this.sprite.gotoAndStop('default');
    });

    _this.stage.carManager.parkingStream.subscribe(function (data) {
      if (!_this.stage.running) {
        return;
      }

      if (data.action === 'PARKING' && _this.x === data.x && _this.y === data.y) {
        _this.busy = true;
        _this.sprite.gotoAndStop('busy');
      }

      if (data.action === 'FREE' && _this.x === data.x && _this.y === data.y) {
        _this.busy = false;
        _this.sprite.gotoAndStop('default');
      }
    });
    return _this;
  }

  _createClass(ParkingSign, [{
    key: 'update',
    value: function update() {
      this.Dy += this.Vy;

      var highLimit = this.busy ? 15 : 5;
      var lowLimit = this.busy ? 10 : 0;

      if (this.busy) {
        this.Vy = Math.abs(this.Vy) / this.Vy * (this.Dy < 10 ? 1.3 : 0.1);
      } else {
        this.Vy = Math.abs(this.Vy) / this.Vy * (this.Dy > 5.2 ? 1.3 : 0.1);
      }

      if (this.Dy > highLimit) {
        this.Vy = -Math.abs(this.Vy);
      }

      if (this.Dy <= lowLimit) {
        this.Vy = Math.abs(this.Vy);
      }

      this.sprite.x = this.dx + 5;
      this.sprite.y = this.dy - 15 - this.Dy;
    }
  }, {
    key: 'forStage',
    value: function forStage() {
      return this.sprite;
    }
  }]);

  return ParkingSign;
}(StageBehaviourObject);