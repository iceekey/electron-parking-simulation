'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('./../config'),
    grid = _require.grid;

var StageBehaviourObject = require('./stage-behaviour-object');
var ParkingSign = require('./parking-sign');

module.exports = function (_StageBehaviourObject) {
  _inherits(BehaviourManager, _StageBehaviourObject);

  function BehaviourManager(stage) {
    _classCallCheck(this, BehaviourManager);

    var _this = _possibleConstructorReturn(this, (BehaviourManager.__proto__ || Object.getPrototypeOf(BehaviourManager)).call(this, stage));

    _this.parkingSigns = [];
    _this.updateBehaviour();
    _this.stage.selector.changeStream.subscribe(_this.updateBehaviour.bind(_this));
    return _this;
  }

  _createClass(BehaviourManager, [{
    key: 'updateBehaviour',
    value: function updateBehaviour(changed) {
      var _this2 = this;

      var ground = this.stage.ground;

      if (changed) {
        this.parkingSigns = this.parkingSigns.filter(function (sign) {
          var isParkingPlace = ground.isParkingPlace(sign.x, sign.y);
          if (!isParkingPlace) {
            _this2.stage.removeBehaviourObject(sign);
          }
          return isParkingPlace;
        });

        var exist = this.parkingSigns.find(function (sign) {
          return sign.x === changed.x && sign.y === changed.y;
        });
        if (ground.isParkingPlace(changed.x, changed.y) && !exist) {
          var sign = new ParkingSign(this.stage, changed.x, changed.y);
          this.parkingSigns.push(sign);
          this.stage.addBehaviourObject(sign);
        }
      } else {
        this.parkingSigns.forEach(function (sign) {
          return _this2.stage.removeBehaviourObject(sign);
        });
        this.parkingSigns = [];

        for (var i = 0; i < grid.rows; i++) {
          for (var j = 0; j < grid.columns; j++) {
            if (ground.isParkingPlace(j, i)) {
              var _sign = new ParkingSign(this.stage, j, i);
              this.parkingSigns.push(_sign);
              this.stage.addBehaviourObject(_sign);
            }
          }
        }
      }
    }
  }, {
    key: 'count',
    value: function count() {
      return this.parkingSigns.length;
    }
  }, {
    key: 'update',
    value: function update() {
      this.parkingSigns.forEach(function (sign) {
        return sign.update();
      });
    }
  }]);

  return BehaviourManager;
}(StageBehaviourObject);