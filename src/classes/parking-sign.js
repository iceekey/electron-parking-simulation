let {parkingSignRect} = require('./../config');
let StageBehaviourObject = require('./stage-behaviour-object');

module.exports = class ParkingSign extends StageBehaviourObject {
  constructor(stage, x, y) {
    super(stage);
    let data = {
      images: [stage.core.assets.getResult('PARKING_SIGN')],
      frames: {
        width: parkingSignRect.width,
        height: parkingSignRect.height,
        count: 2,
        spacing: 0,
        margin: 0,
        regX: parkingSignRect.width / 2,
        regY: parkingSignRect.height / 2
      },
      animations: {
        default: 0,
        busy: 1
      }
    };

    this.busy = false;
    this.Dy = 0;
    this.Vy = 0.1;

    this.x = x;
    this.y = y;

    let shift = this.stage.ground.getShift(x, y);
    this.dx = shift.dx;
    this.dy = shift.dy;

    this.sheet = new createjs.SpriteSheet(data);
    this.sprite = new createjs.Sprite(this.sheet, 'default');

    this.sprite.scaleX = 1;
    this.sprite.scaleY = 1;

    this.stage.runStream.subscribe(() => {
      this.busy = false;
      this.sprite.gotoAndStop('default');
    });

    this.stage.carManager.parkingStream.subscribe(data => {
      if (!this.stage.running) {
        return;
      }

      if (data.action === 'PARKING' && this.x === data.x && this.y === data.y) {
        this.busy = true;
        this.sprite.gotoAndStop('busy');
      }

      if (data.action === 'FREE' && this.x === data.x && this.y === data.y) {
        this.busy = false;
        this.sprite.gotoAndStop('default');
      }
    });
  }

  update() {
    this.Dy += this.Vy;

    let highLimit = this.busy ? 15 : 5;
    let lowLimit = this.busy ? 10 : 0;

    if (this.busy) {
      this.Vy = Math.abs(this.Vy) / this.Vy * (this.Dy < 10 ? 1.3 : 0.1);
    } else {
      this.Vy = Math.abs(this.Vy) / this.Vy * (this.Dy > 5.2 ? 1.3 : 0.1);
    }

    if (this.Dy > highLimit) {
      this.Vy = -Math.abs(this.Vy);
    }

    if (this.Dy <= lowLimit) {
      this.Vy = Math.abs(this.Vy);
    }


    this.sprite.x = this.dx + 5;
    this.sprite.y = this.dy - 15 - this.Dy;
  }

  forStage() {
    return this.sprite;
  }
};