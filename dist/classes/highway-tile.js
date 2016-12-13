'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('./../config'),
    grid = _require.grid;

var GroundTile = require('./ground-tile');

module.exports = function (_GroundTile) {
  _inherits(HighwayTile, _GroundTile);

  function HighwayTile(stage, x, y) {
    _classCallCheck(this, HighwayTile);

    return _possibleConstructorReturn(this, (HighwayTile.__proto__ || Object.getPrototypeOf(HighwayTile)).call(this, stage, x, y));
  }

  // update() {
  //   super.update();
  //   // this.sprite.x = this.globalX;
  //   // this.sprite.y = this.globalY;

  //   // this.sprite.scaleX = this.scaleX;
  //   // this.sprite.scaleY = this.scaleY;
  // }


  return HighwayTile;
}(GroundTile);