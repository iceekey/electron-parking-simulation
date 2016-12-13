'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('./../config'),
    grid = _require.grid;

var StageBehaviourObject = require('./stage-behaviour-object');
var Issue = require('./issue');

var PF = require('@screeps/pathfinding');

module.exports = function (_StageBehaviourObject) {
  _inherits(IssueManager, _StageBehaviourObject);

  function IssueManager(stage) {
    _classCallCheck(this, IssueManager);

    var _this = _possibleConstructorReturn(this, (IssueManager.__proto__ || Object.getPrototypeOf(IssueManager)).call(this, stage));

    _this.issues = [];
    _this.finder = new PF.AStarFinder();
    _this.updateIssues();

    _this.stage.runStream.subscribe(function (running) {
      _this.issues.forEach(function (issue) {
        return _this.stage.removeBehaviourObject(issue);
      });
      _this.issues = [];

      if (!running) {
        _this.updateIssues();
      }
    });

    _this.stage.selector.changeStream.subscribe(_this.updateIssues.bind(_this));
    return _this;
  }

  _createClass(IssueManager, [{
    key: 'updateIssues',
    value: function updateIssues() {
      var _this2 = this;

      this.issues.forEach(function (issue) {
        return _this2.stage.removeBehaviourObject(issue);
      });
      this.issues = [];

      var ground = this.stage.ground;

      var parkingIn = ground.findIn();
      var parkingOut = ground.findOut();

      if (parkingIn !== null && parkingOut !== null) {
        // Въезд на парковку не должен совпадать с выездом
        if (parkingIn.x == parkingOut.x && parkingIn.y === parkingOut.y) {
          this.addIssue(parkingIn.x, parkingIn.y);
        }

        // Должен быть только въезд и выезд
        for (var i = 0; i < grid.columns; i++) {
          var tile = ground.tiles[grid.rows - 1][i];
          if (tile.isRoad() && tile.x !== parkingIn.x && tile.x !== parkingOut.x) {
            this.addIssue(tile.x, tile.y);
          }
        }
      }

      // Парковки не должны стоять на шоссе
      for (var _i = 0; _i < grid.columns; _i++) {
        var _tile = ground.tiles[grid.rows][_i];

        var _tile$bindedPPCount = _tile.bindedPPCount(),
            bindedCount = _tile$bindedPPCount.bindedCount;

        if (bindedCount > 0) {
          this.addIssue(_tile.x, _tile.y);
        }
      }

      for (var _i2 = 0; _i2 < grid.rows; _i2++) {
        for (var j = 0; j < grid.columns; j++) {
          var _ground$checkBehaviou = ground.checkBehaviour(j, _i2),
              roadsAround = _ground$checkBehaviou.roadsAround;

          var _ground$bindedPPCount = ground.bindedPPCount(j, _i2),
              bindedCount = _ground$bindedPPCount.bindedCount;

          // Проверка на то, что все тайлы дороги имеют минимум 2 дорооги по краям


          if (ground.isRoad(j, _i2)) {
            if (roadsAround + bindedCount < 2) {
              this.addIssue(j, _i2);
              continue;
            }

            // Можно доехать до этой клетки от стартовой
            var path = this.finder.findPath(0, grid.rows, j, _i2, this.stage.carManager.getMatrix(j, _i2, false, true));
            var last = path[path.length - 1];
            if (last[0] !== j || last[1] !== _i2) {
              this.addIssue(j, _i2);
              continue;
            }

            // Можно доехать от этой клетки до итоговой
            var matrix = this.stage.carManager.getMatrix(null, null, true);
            path = this.finder.findPath(j, _i2, grid.columns - 1, grid.rows, matrix);
            last = path[path.length - 1];
            if (last[0] !== grid.columns - 1 || last[1] !== grid.rows) {
              this.addIssue(j, _i2);
              continue;
            }
          }
          // Все парковки должны быть прикреплены к одной дороге
          if (ground.isParkingPlace(j, _i2)) {
            if (roadsAround < 1) {
              this.addIssue(j, _i2);
              continue;
            }
          }
        }
      }

      for (var _i3 = 0; _i3 < grid.rows; _i3++) {
        for (var _j = 0; _j < grid.columns; _j++) {
          if (ground.isParkingPlace(_j, _i3)) {
            (function () {
              var binded = ground.getOrBindPP(_j, _i3);
              if (_this2.issues.some(function (issue) {
                return issue.x === binded.x && issue.y === binded.y;
              })) {
                _this2.addIssue(_j, _i3);
              }
            })();
          }
        }
      }
    }
  }, {
    key: 'addIssue',
    value: function addIssue(x, y) {
      var issue = new Issue(this.stage, x, y);
      this.stage.addBehaviourObject(issue, this.stage.draw.getChildIndex(this.stage.selector.forStage()));
      this.issues.push(issue);
    }
  }, {
    key: 'update',
    value: function update() {
      this.issues.forEach(function (issue) {
        return issue.update();
      });
    }
  }, {
    key: 'valid',
    get: function get() {
      return this.issues.length === 0;
    }
  }]);

  return IssueManager;
}(StageBehaviourObject);