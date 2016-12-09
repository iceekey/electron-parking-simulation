let {grid} = require('./../config');
let StageBehaviourObject = require('./stage-behaviour-object');
let Car = require('./car');
let Generator = require('./generator');

let PD = require('probability-distributions');
let Rx = require('rxjs');
let PF = require('@screeps/pathfinding');
let _ = require('lodash');

module.exports = class CarManager extends StageBehaviourObject {
  constructor(stage) {
    super(stage);
    this.cars = [];
    this.generator = new Generator();
    this.generatorTimeout = null;

    this.parkingStream = new Rx.Subject();
    this.finder = new PF.AStarFinder();

    this.stage.runStream.subscribe(running => {
      if (!running) {
        this.cars.forEach(car => {
          this.stage.removeBehaviourObject(car);
        });
      }
    });
  }

  addCar() {
    let car = new Car(this.stage, 0, grid.rows), path;
    if (this.stage.parkingManager.checkFree() && Math.random() <= 0.3) {
      let zone = this.stage.parkingManager.getFreeParkingZone();
      let bindedRoad = this.stage.ground.getOrBindPP(zone[0], zone[1]);
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

  tick() {
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

    this.cars.filter(car => !car.parked).forEach(car => {
      car.stay();
      car.next();
    });

    this.cars = this.cars.filter(car => {
      return !car.deleted && !this.stage.ground.isExit(car.x, car.y);
    });
  }

  toExit(car) {
    let bindedRoad = this.stage.ground.getOrBindPP(car.x, car.y);
    let path = this.finder.findPath(bindedRoad.x, bindedRoad.y, grid.columns - 1, grid.rows,
      this.getMatrix(null, null, true));
    car.setPath(path);
  }

  isCarQueueFree() {
    if (this.cars.length === 0) {
      return true;
    }

    let c = this.cars[this.cars.length - 1];
    return !(c.targetX === 0 && c.targetY === grid.rows);
  }

  getMatrix(x, y, lockIn, lockOut) {
    let matrix = _.clone(this.stage.ground.grid).map(row => _.clone(row));
    for (let i = 0; i < grid.rows + 1; i++) {
      for (let j = 0; j < grid.columns; j++) {
        if (matrix[i][j] < 0) {
          matrix[i][j] = 0;
        } else if (matrix[i][j] > 0) {
          matrix[i][j] = 1;
        }
      }
    }

    for (let i = 0; i < grid.columns; i++) {
      matrix[grid.rows - 1][i] = 0;
    }

    let parkingIn = this.stage.ground.findIn();
    let parkingOut = this.stage.ground.findOut();

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

  update() {
    this.cars.forEach(car => car.update());
  }

  forStage() {
    return this.cars.map(car => car.forStage());
  }
};