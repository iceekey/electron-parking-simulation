let {carColors, carRect, grid, groundRect, coreConfig} = require('./../config');
let StageBehaviourObject = require('./stage-behaviour-object');

let _ = require('lodash');

const CAR_TYPES_COUNT = 8;
const CAR_FRAMES_COUNT = 8;

module.exports = class Car extends StageBehaviourObject {
  constructor(stage, x, y) {
    super(stage);
    let color = carColors[Math.floor(carColors.length * Math.random())];
    let type = Math.floor(CAR_TYPES_COUNT * Math.random());

    let data = {
      images: [stage.core.assets.getResult('CARS_' + color.toUpperCase())],
      frames: {
        width: carRect.width,
        height: carRect.height,
        count: CAR_TYPES_COUNT * CAR_FRAMES_COUNT,
        spacing: 0,
        margin: 0,
        regX: carRect.width / 2,
        regY: carRect.height / 2
      },
      animations: {
        westSouth: type * CAR_FRAMES_COUNT,
        eastNorth: type * CAR_FRAMES_COUNT + 4,
        westNorth: type * CAR_FRAMES_COUNT + 2,
        eastSouth: type * CAR_FRAMES_COUNT + 6
      }
    };

    this.x = this.targetX = x;
    this.y = this.targetY = y;

    let shift = this.stage.ground.getShift(this.x, this.y);
    this.dx = shift.dx;
    this.dy = shift.dy;

    this.vx = 0;
    this.vy = 0;

    this.path = [];
    this.step = 0;

    this.sheet = new createjs.SpriteSheet(data);
    this.sprite = new createjs.Sprite(this.sheet, 'eastSouth');

    this.sprite.scaleX = 1;
    this.sprite.scaleY = 1;

    this.alpha = 0;
    this.parked = false;

    this.deleted = false;
    this.onRemove = null;
    this.onRemoveResolver = null;
  }

  get width() {
    return carRect.width;
  }

  get height() {
    return carRect.height;
  }

  setPath(path) {
    if (_.isArray(path)) {
      this.path = path;
      this.step = 0;
    }
  }

  next() {
    let pathChunk = this.path[this.step];
    let ground = this.stage.ground;

    if (_.isArray(pathChunk)) {
      let x = pathChunk[0], y = pathChunk[1];
      if (ground.isExit(x, y)) {
        this.onRemove = new Promise(res => {
          this.onRemoveResolver = res;
        });
      }

      this.goto(x, y);
      this.step += 1;
      return true;
    } else {
      if (this.stage.ground.isParkingPlace(this.x, this.y)) {
        this.stage.carManager.parkingStream.next({
          action: 'PARKING',
          x: this.x,
          y: this.y
        });
        this.stage.parkingManager.park(this);
      }

      if (this.stage.ground.isExit(this.x, this.y)) {
        this.stage.draw.removeChild(this.sprite);
      }
    }

    return false;
  }

  goto(x, y) {
    let shift = this.stage.ground.getShift(this.x, this.y);
    let targetShift = this.stage.ground.getShift(x, y);

    this.targetX = x;
    this.targetY = y;

    this.vx = (targetShift.dx - shift.dx) / this.stage.core.tickEncounterNominal;
    this.vy = (targetShift.dy - shift.dy) / this.stage.core.tickEncounterNominal;

    let directionV = x > this.x ? 'east' : 'west';
    if (x === this.x) {
      directionV = y > this.y ? 'east' : 'west';
    }

    let directionH = y > this.y ? 'South' : 'North';
    if (y === this.y) {
      directionH =  x > this.x ? 'North' : 'South';
    }

    this.sprite.gotoAndStop(directionV + directionH);
  }

  stay() {
    this.x = this.targetX;
    this.y = this.targetY;
    let shift = this.stage.ground.getShift(this.x, this.y);
    this.dx = shift.dx;
    this.dy = shift.dy;
    this.vx = 0;
    this.vy = 0;
  }

  update() {
    if (this.deleted) {
      return;
    }

    if (this.alpha < 1 && this.onRemove === null) {
      this.alpha += 0.1;
    }

    if (this.alpha > 0 && this.onRemove !== null) {
      this.alpha -= 0.1;
    }

    if (this.alpha <= 0 && this.onRemove !== null) {
      this.deleted = true;
      this.onRemoveResolver(this.forStage());
    }

    this.dx += this.vx;
    this.dy += this.vy;

    this.sprite.alpha = this.alpha;
    this.sprite.x = this.dx;
    this.sprite.y = this.dy;
  }

  forStageRemove() {
    if (this.onRemove === null) {
      this.onRemove = new Promise(res => {
        this.onRemoveResolver = res;
      });
    }

    return this.onRemove;
  }

  forStage() {
    return this.sprite;
  }
};