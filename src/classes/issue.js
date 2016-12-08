let {groundRect} = require('./../config');
let StageBehaviourObject = require('./stage-behaviour-object');

module.exports = class Issue extends StageBehaviourObject {
  constructor(stage, x, y) {
    super(stage);
    let data = {
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

    this.x = x;
    this.y = y;

    this.sheet = new createjs.SpriteSheet(data);
    this.sprite = new createjs.Sprite(this.sheet, 'error');

    this.sprite.scaleX = 1;
    this.sprite.scaleY = 1;

    let shift = this.stage.ground.getShift(this.x, this.y);
    this.sprite.x = shift.dx - groundRect.xShift;
    this.sprite.y = shift.dy - groundRect.yShift;
  }

  update() {}

  forStage() {
    return this.sprite;
  }
};