'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require('lodash');

var _require = require('./../config'),
    grid = _require.grid;

var Generator = require('./generator');

module.exports = function () {
  function ParkingManager(stage) {
    var _this = this;

    _classCallCheck(this, ParkingManager);

    this.stage = stage;
    this.parkingZones = [];
    this.parkedCars = [];
    this.busy = [];
    this.busyStat = 0;
    this.earned = 0;
    this.generator = new Generator();
    this.generator.setExp(0.008);

    this.updateParkingZones();

    this.stage.runStream.subscribe(function () {
      _this.busyStat = 0;
      $('#points').html('Доход парковки: 0 руб');
      $('#parkingZones').html('Занято 0 из ' + _this.parkingZones.length + ' парковочных мест');

      _this.parkedCars = [];
      _this.busy = [];
      _this.earned = 0;
    });

    this.stage.selector.changeStream.subscribe(this.updateParkingZones.bind(this));
  }

  _createClass(ParkingManager, [{
    key: 'getFreeParkingZone',
    value: function getFreeParkingZone() {
      var zone = null;

      if (!this.checkFree()) {
        return null;
      }

      do {
        zone = Math.floor(this.parkingZones.length * Math.random());
        zone = this.parkingZones[zone];
      } while (_.includes(this.busy, zone));

      this.busy.push(zone);
      return zone;
    }
  }, {
    key: 'checkFree',
    value: function checkFree() {
      this.busy = this.busy.filter(function (zone) {
        return zone !== null;
      });
      return this.parkingZones.length > this.busy.length;
    }
  }, {
    key: 'park',
    value: function park(car) {
      var timer = this.generator.next();
      if (timer > 1680) {
        timer = 1680;
      }

      car.parked = true;
      this.parkedCars.push({
        time: timer,
        timer: timer,
        car: car
      });

      $('#parkingZones').html('Занято ' + ++this.busyStat + ' из ' + this.parkingZones.length + ' парковочных мест');
    }
  }, {
    key: 'tick',
    value: function tick() {
      var _this2 = this;

      this.parkedCars.forEach(function (parked) {
        parked.timer -= 1;
        if (parked.timer < 0) {
          (function () {
            var time = parked.time;
            if (time <= 40) {
              _this2.earned += 100 * Math.ceil(time / 10);
            } else if (time <= 120) {
              _this2.earned += 80 * Math.ceil(time / 10);
            } else {
              _this2.earned += 50 * Math.ceil(time / 10);
            }

            var car = parked.car;
            car.parked = false;

            _this2.stage.carManager.toExit(car);
            setTimeout(function () {
              _this2.stage.carManager.parkingStream.next({
                action: 'FREE',
                x: car.x,
                y: car.y
              });
            }, 300);

            _this2.busy = _this2.busy.filter(function (zone) {
              return !(zone[0] === car.x && zone[1] === car.y);
            });

            $('#points').html('Доход парковки: ' + _this2.earned + ' руб.');
            $('#parkingZones').html('Занято ' + --_this2.busyStat + ' из ' + _this2.parkingZones.length + ' парковочных мест');
          })();
        }
      });

      this.parkedCars = this.parkedCars.filter(function (parked) {
        return parked.car.parked;
      });
    }
  }, {
    key: 'updateParkingZones',
    value: function updateParkingZones() {
      this.parkingZones = [];
      var groundGrid = this.stage.ground.grid;
      // Remember all the parking zones and modify default grid
      for (var i = 0; i < grid.rows; i++) {
        for (var j = 0; j < grid.columns; j++) {
          if (groundGrid[i][j] < 0) {
            this.parkingZones.push([j, i]);
          }
        }
      }
    }
  }]);

  return ParkingManager;
}();