let {grid} = require('./../config');
let GroundTile = require('./ground-tile');

module.exports = class HighwayTile extends GroundTile {
  constructor(stage, x, y) {
    super(stage, x, y);
  }

  // update() {
  //   super.update();
  //   // this.sprite.x = this.globalX;
  //   // this.sprite.y = this.globalY;

  //   // this.sprite.scaleX = this.scaleX;
  //   // this.sprite.scaleY = this.scaleY;
  // }
};