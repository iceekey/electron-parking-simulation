'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('./../config'),
    groundRect = _require.groundRect;

var StageBehaviourObject = require('./stage-behaviour-object');

module.exports = function (_StageBehaviourObject) {
  _inherits(Issue, _StageBehaviourObject);

  function Issue(stage, x, y) {
    _classCallCheck(this, Issue);

    var _this = _possibleConstructorReturn(this, (Issue.__proto__ || Object.getPrototypeOf(Issue)).call(this, stage));

    var data = {
      images: [stage.core.assets.getResult('SELECTOR')],
      frames: {
        width: groundRect.width,
        height: groundRect.height,
        count: 2,
        spacing: 0,
        margin: 0,
        regX: groundRect.width / 2,
        regY: groundRect.height / 2
      },
      animations: {
        default: 0,
        error: 1
      }
    };

    _this.x = x;
    _this.y = y;

    _this.sheet = new createjs.SpriteSheet(data);
    _this.sprite = new createjs.Sprite(_this.sheet, 'error');

    _this.sprite.scaleX = 1;
    _this.sprite.scaleY = 1;

    var shift = _this.stage.ground.getShift(_this.x, _this.y);
    _this.sprite.x = shift.dx - groundRect.xShift;
    _this.sprite.y = shift.dy - groundRect.yShift;
    return _this;
  }

  _createClass(Issue, [{
    key: 'update',
    value: function update() {}
  }, {
    key: 'forStage',
    value: function forStage() {
      return this.sprite;
    }
  }]);

  return Issue;
}(StageBehaviourObject);