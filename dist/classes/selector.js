'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('./../config'),
    grid = _require.grid,
    groundRect = _require.groundRect;

var StageBehaviourObject = require('./stage-behaviour-object');
var GroundTile = require('./ground-tile');

var Rx = require('rxjs');

module.exports = function (_StageBehaviourObject) {
  _inherits(Selector, _StageBehaviourObject);

  function Selector(stage) {
    _classCallCheck(this, Selector);

    var _this = _possibleConstructorReturn(this, (Selector.__proto__ || Object.getPrototypeOf(Selector)).call(this, stage));

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

    _this.sheet = new createjs.SpriteSheet(data);
    _this.sprite = new createjs.Sprite(_this.sheet, 'default');

    _this.sprite.scaleX = 1;
    _this.sprite.scaleY = 1;

    _this.selected = null;
    _this.selectedCache = null;
    _this.groundSelected = null;
    _this.changeStream = new Rx.Subject();

    _this.stage.runStream.subscribe(function (running) {
      if (_this.selected !== null && _this.selectedCache !== null) {
        _this.stage.ground.grid[_this.selected.y][_this.selected.x] = _this.selectedCache;
        _this.changeStream.next(_this.selected);
      }

      _this.sprite.visible = false;
      _this.selected = null;
      _this.selectedCache = null;
      _this.groundSelected = 'grass';

      $('.tile').removeClass('active');
      $('#grass').addClass('active');
    });

    var self = _this;
    $('.tile').click(function () {
      var $tile = $(this);

      $('.tile').removeClass('active');
      $tile.addClass('active');

      self.groundSelected = $tile.attr('id');
    });

    $('#surface').click(function (e) {
      if (_this.stage.running || !_this.selected) {
        return;
      }

      var selected = _this.selected;
      var ground = _this.stage.ground;
      switch (_this.groundSelected) {
        case 'parking':
          ground.grid[selected.y][selected.x] = -1;
          break;
        case 'road':
          ground.grid[selected.y][selected.x] = 1;
          break;
        default:
          ground.grid[selected.y][selected.x] = 0;
      };

      _this.selectedCache = null;
    });

    $('#surface').mousemove(function (e) {
      if (_this.stage.running) {
        return;
      }
      // find owner
      var offsetX = e.offsetX;
      var offsetY = e.offsetY;
      var tiles = _this.stage.ground.tiles;

      var closest = null;
      for (var i = 0; i < grid.rows; i++) {
        for (var j = 0; j < grid.columns; j++) {
          if (tiles[i][j].checkHit(offsetX, offsetY)) {
            var tile = tiles[i][j];
            if (closest === null) {
              closest = tile;
              continue;
            }

            var shift = tile.shift;
            var closestShift = closest.shift;
            var summ = offsetX + shift.dx + offsetY + shift.dy;
            var closestSumm = offsetX + closestShift.dx + offsetY + closestShift.dy;
            if (summ < closestSumm) {
              closest = tile;
            }
          }
        }
      }

      if (closest === null) {
        _this.sprite.visible = false;
      } else {
        _this.sprite.visible = true;
      }

      if (closest === null && _this.selected !== null && _this.selectedCache !== null) {
        _this.stage.ground.grid[_this.selected.y][_this.selected.x] = _this.selectedCache;
        _this.changeStream.next(_this.selected);
      }

      if (closest !== null && _this.selected !== closest) {
        var ground = _this.stage.ground;

        if (_this.selected !== null && _this.selectedCache !== null) {
          ground.grid[_this.selected.y][_this.selected.x] = _this.selectedCache;
          _this.changeStream.next(_this.selected);
        }

        _this.selectedCache = ground.grid[closest.y][closest.x];

        switch (_this.groundSelected) {
          case 'parking':
            ground.grid[closest.y][closest.x] = -1;
            break;
          case 'road':
            ground.grid[closest.y][closest.x] = 1;
            break;
          default:
            ground.grid[closest.y][closest.x] = 0;
        };

        _this.selected = closest;
        _this.changeStream.next(_this.selected);
      }
    });
    return _this;
  }

  // mouseMoveHandler() {
  // }

  _createClass(Selector, [{
    key: 'update',
    value: function update() {
      if (this.selected !== null) {
        var shift = this.selected.shift;
        this.sprite.x = shift.dx - groundRect.xShift;
        this.sprite.y = shift.dy - groundRect.yShift;
      }
    }
  }, {
    key: 'forStage',
    value: function forStage() {
      return this.sprite;
    }
  }]);

  return Selector;
}(StageBehaviourObject);