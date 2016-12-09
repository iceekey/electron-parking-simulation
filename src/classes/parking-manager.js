let _ = require('lodash');
let {grid} = require('./../config');

let Generator = require('./generator');

module.exports = class ParkingManager {
  constructor(stage) {
    this.stage = stage;
    this.parkingZones = [];
    this.parkedCars = [];
    this.busy = [];
    this.busyStat = 0;
    this.earned = 0;
    this.generator = new Generator();
    this.generator.setExp(0.008);

    this.updateParkingZones();

    this.stage.runStream.subscribe(() => {
      this.busyStat = 0;
      $('#points').html('Доход парковки: 0 руб');
      $('#parkingZones').html('Занято 0 из ' + this.parkingZones.length + ' парковочных мест');

      this.parkedCars = [];
      this.busy = [];
      this.earned = 0;
    });

    this.stage.selector.changeStream.subscribe(this.updateParkingZones.bind(this));
  }

  getFreeParkingZone() {
    let zone = null;

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

  checkFree() {
    this.busy = this.busy.filter(zone => zone !== null);
    return this.parkingZones.length > this.busy.length;
  }

  park(car) {
    let timer = this.generator.next();
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

  tick() {
    this.parkedCars.forEach(parked => {
      parked.timer -= 1;
      if (parked.timer < 0) {
        let time = parked.time;
        if (time <= 40) {
          this.earned += 100 * Math.ceil(time / 10);
        } else if (time <= 120) {
          this.earned += 80 * Math.ceil(time / 10);
        } else {
          this.earned += 50 * Math.ceil(time / 10);
        }


        let car = parked.car;
        car.parked = false;

        this.stage.carManager.toExit(car);
        setTimeout(() => {
          this.stage.carManager.parkingStream.next({
            action: 'FREE',
            x: car.x,
            y: car.y
          });
        }, 300);


        this.busy = this.busy.filter(zone => {
          return !(zone[0] === car.x && zone[1] === car.y);
        });

        $('#points').html('Доход парковки: ' + this.earned + ' руб.');
        $('#parkingZones').html('Занято ' + --this.busyStat + ' из ' + this.parkingZones.length + ' парковочных мест');
      }
    });

    this.parkedCars = this.parkedCars.filter(parked => parked.car.parked);
  }

  updateParkingZones() {
    this.parkingZones = [];
    let groundGrid = this.stage.ground.grid;
    // Remember all the parking zones and modify default grid
    for (let i = 0; i < grid.rows; i++) {
      for (let j = 0; j < grid.columns; j++) {
        if (groundGrid[i][j] < 0) {
          this.parkingZones.push([j, i]);
        }
      }
    }
  }
};