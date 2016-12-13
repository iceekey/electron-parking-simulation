'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('./../config'),
    grid = _require.grid;

var StageBehaviourObject = require('./stage-behaviour-object');
var Car = require('./car');
var Generator = require('./generator');

var PD = require('probability-distributions');
var Rx = require('rxjs');
var PF = require('@screeps/pathfinding');
var _ = require('lodash');

module.exports = function (_StageBehaviourObject) {
  _inherits(CarManager, _StageBehaviourObject);

  function CarManager(stage) {
    _classCallCheck(this, CarManager);

    var _this = _possibleConstructorReturn(this, (CarManager.__proto__ || Object.getPrototypeOf(CarManager)).call(this, stage));

    _this.cars = [];
    _this.generator = new Generator();
    _this.generatorTimeout = null;

    _this.parkingStream = new Rx.Subject();
    _this.finder = new PF.AStarFinder();

    _this.stage.runStream.subscribe(function (running) {
      if (!running) {
        _this.cars.forEach(function (car) {
          _this.stage.removeBehaviourObject(car);
        });
      }
    });
    return _this;
  }

  _createClass(CarManager, [{
    key: 'addCar',
    value: function addCar() {
      var car = new Car(this.stage, 0, grid.rows),
          path = void 0;
      if (this.stage.parkingManager.checkFree() && Math.random() <= 0.3) {
        var zone = this.stage.parkingManager.getFreeParkingZone();
        var bindedRoad = this.stage.ground.getOrBindPP(zone[0], zone[1]);
        path = this.finder.findPath(0, grid.rows, bindedRoad.x, bindedRoad.y, this.getMatrix(null, null, false, true));
        path.push(zone);
        car.setPath(path.slice(1, path.length));
        this.stage.addBehaviourObject(car, this.stage.ground.count() + this.stage.behaviourManager.count() + 1);
        this.cars.push(car);
      } else {
        path = this.finder.findPath(0, grid.rows, grid.columns - 1, grid.rows, this.getMatrix());
        car.setPath(path.slice(1, path.length));
        this.stage.addBehaviourObject(car);
        this.cars.push(car);
      }
    }
  }, {
    key: 'tick',
    value: function tick() {
      var _this2 = this;

      if (this.stage.running) {
        if (this.generatorTimeout === null) {
          this.generatorTimeout = this.generator.next();
        }

        this.generatorTimeout -= 1;

        if (this.isCarQueueFree() && this.generatorTimeout <= 0) {
          this.addCar();
          this.generatorTimeout = this.generator.next();
        }
      }

      this.cars.filter(function (car) {
        return !car.parked;
      }).forEach(function (car) {
        car.stay();
        car.next();
      });

      this.cars = this.cars.filter(function (car) {
        return !car.deleted && !_this2.stage.ground.isExit(car.x, car.y);
      });
    }
  }, {
    key: 'toExit',
    value: function toExit(car) {
      var bindedRoad = this.stage.ground.getOrBindPP(car.x, car.y);
      var path = this.finder.findPath(bindedRoad.x, bindedRoad.y, grid.columns - 1, grid.rows, this.getMatrix(null, null, true));
      car.setPath(path);
    }
  }, {
    key: 'isCarQueueFree',
    value: function isCarQueueFree() {
      if (this.cars.length === 0) {
        return true;
      }

      var c = this.cars[this.cars.length - 1];
      return !(c.targetX === 0 && c.targetY === grid.rows);
    }
  }, {
    key: 'getMatrix',
    value: function getMatrix(x, y, lockIn, lockOut) {
      var matrix = _.clone(this.stage.ground.grid).map(function (row) {
        return _.clone(row);
      });
      for (var i = 0; i < grid.rows + 1; i++) {
        for (var j = 0; j < grid.columns; j++) {
          if (matrix[i][j] < 0) {
            matrix[i][j] = 0;
          } else if (matrix[i][j] > 0) {
            matrix[i][j] = 1;
          }
        }
      }

      for (var _i = 0; _i < grid.columns; _i++) {
        matrix[grid.rows - 1][_i] = 0;
      }

      var parkingIn = this.stage.ground.findIn();
      var parkingOut = this.stage.ground.findOut();

      if (parkingIn && lockIn !== true) {
        if (!(parkingIn.x === parkingOut.x && lockOut === true)) {
          matrix[parkingIn.y][parkingIn.x] = 1;
        }
      }

      if (parkingOut && lockOut !== true) {
        if (!(parkingIn.x === parkingOut.x && lockIn === true)) {
          matrix[parkingOut.y][parkingOut.x] = 1;
        }
      }

      if (_.isNumber(x) && _.isNumber(y)) {
        matrix[y][x] = 1;
      }

      return new PF.Grid(grid.columns, grid.rows + 1, matrix);
    }
  }, {
    key: 'update',
    value: function update() {
      this.cars.forEach(function (car) {
        return car.update();
      });
    }
  }, {
    key: 'forStage',
    value: function forStage() {
      return this.cars.map(function (car) {
        return car.forStage();
      });
    }
  }]);

  return CarManager;
}(StageBehaviourObject);