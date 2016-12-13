'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('./../config'),
    grid = _require.grid,
    defaultGrid = _require.defaultGrid;

var _ = require('lodash');

var GroundTile = require('./ground-tile');
var HighwayTile = require('./highway-tile');
var StageBehaviourObject = require('./stage-behaviour-object');

module.exports = function (_StageBehaviourObject) {
  _inherits(Ground, _StageBehaviourObject);

  function Ground(stage) {
    _classCallCheck(this, Ground);

    var _this = _possibleConstructorReturn(this, (Ground.__proto__ || Object.getPrototypeOf(Ground)).call(this, stage));

    _this.grid = defaultGrid;
    _this.stage = stage;
    _this.tiles = [];

    // Create tiles from default grid
    for (var i = 0; i < grid.rows; i++) {
      for (var j = 0; j < grid.columns; j++) {
        if (!_.isArray(_this.tiles[i])) {
          _this.tiles[i] = [];
        }

        _this.tiles[i][j] = new GroundTile(_this.stage, j, i);
      }
    }

    // Create highway
    var highway = [];
    var highwayGrid = [];
    var highwayRow = _this.tiles.length;
    for (var _i = 0; _i < grid.columns; _i++) {
      highwayGrid[_i] = 1;
      highway[_i] = new HighwayTile(_this.stage, _i, highwayRow);
    }

    _this.tiles.push(highway);
    _this.grid.push(highwayGrid);
    return _this;
  }

  _createClass(Ground, [{
    key: 'count',
    value: function count() {
      return grid.columns * (grid.rows + 1);
    }
  }, {
    key: 'findIn',
    value: function findIn() {
      for (var i = 0; i < grid.columns; i++) {
        var tile = this.tiles[grid.rows - 1][i];
        if (tile.isRoad()) {
          return {
            x: tile.x,
            y: tile.y
          };
        }
      }

      return null;
    }
  }, {
    key: 'findOut',
    value: function findOut() {
      for (var i = grid.columns - 1; i >= 0; i--) {
        var tile = this.tiles[grid.rows - 1][i];
        if (tile.isRoad()) {
          return {
            x: tile.x,
            y: tile.y
          };
        }
      }

      return null;
    }
  }, {
    key: 'isRoad',
    value: function isRoad(x, y) {
      if (x >= grid.columns || y >= grid.rows + 1 || x < 0 || y < 0) {
        return false;
      }

      return this.tiles[y][x].isRoad();
    }
  }, {
    key: 'isParkingPlace',
    value: function isParkingPlace(x, y) {
      if (x >= grid.columns || y >= grid.rows + 1 || x < 0 || y < 0) {
        return false;
      }

      return this.tiles[y][x].isParkingPlace();
    }
  }, {
    key: 'checkBehaviour',
    value: function checkBehaviour(x, y) {
      if (x >= grid.columns || y >= grid.rows + 1 || x < 0 || y < 0) {
        return false;
      }

      return this.tiles[y][x].checkBehaviour();
    }
  }, {
    key: 'getOrBindPP',
    value: function getOrBindPP(x, y) {
      if (x >= grid.columns || y >= grid.rows + 1 || x < 0 || y < 0) {
        return { x: -1, y: -1 };
      }

      return this.tiles[y][x].getOrBindPP();
    }
  }, {
    key: 'bindedPPCount',
    value: function bindedPPCount(x, y) {
      if (x >= grid.columns || y >= grid.rows + 1 || x < 0 || y < 0) {
        return { x: -1, y: -1 };
      }

      return this.tiles[y][x].bindedPPCount();
    }
  }, {
    key: 'isExit',
    value: function isExit(x, y) {
      return x === grid.columns - 1 && y == grid.rows;
    }
  }, {
    key: 'getShift',
    value: function getShift(x, y) {
      var tile = this.tiles[y][x] || null;
      return tile ? tile.shift : { dx: 0, dy: 0 };
    }
  }, {
    key: 'update',
    value: function update() {
      this.tiles.forEach(function (tilesRow) {
        return tilesRow.forEach(function (tile) {
          return tile.update();
        });
      });
    }
  }, {
    key: 'forStage',
    value: function forStage() {
      var groundRowsForStage = this.tiles.map(function (tilesRow) {
        return tilesRow.map(function (tile) {
          return tile.forStage();
        }).reverse();
      });

      return Array.prototype.concat.apply([], groundRowsForStage);
    }
  }]);

  return Ground;
}(StageBehaviourObject);