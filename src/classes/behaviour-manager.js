let {grid} = require('./../config');
let StageBehaviourObject = require('./stage-behaviour-object');
let ParkingSign = require('./parking-sign');

module.exports = class BehaviourManager extends StageBehaviourObject {
  constructor(stage) {
    super(stage);
    this.parkingSigns = [];
    this.updateBehaviour();
    this.stage.selector.changeStream.subscribe(this.updateBehaviour.bind(this));
  }

  updateBehaviour(changed) {
    let ground = this.stage.ground;

    if (changed) {
      this.parkingSigns = this.parkingSigns.filter(sign => {
        let isParkingPlace = ground.isParkingPlace(sign.x, sign.y);
        if (!isParkingPlace) {
          this.stage.removeBehaviourObject(sign);
        }
        return isParkingPlace;
      });

      let exist = this.parkingSigns.find(sign => sign.x === changed.x && sign.y === changed.y);
      if (ground.isParkingPlace(changed.x, changed.y) && !exist) {
        let sign = new ParkingSign(this.stage, changed.x, changed.y);
        this.parkingSigns.push(sign);
        this.stage.addBehaviourObject(sign);
      }
    } else {
      this.parkingSigns.forEach(sign => this.stage.removeBehaviourObject(sign));
      this.parkingSigns = [];

      for (let i = 0; i < grid.rows; i++) {
        for (let j = 0; j < grid.columns; j++) {
          if (ground.isParkingPlace(j, i)) {
            let sign = new ParkingSign(this.stage, j, i);
            this.parkingSigns.push(sign);
            this.stage.addBehaviourObject(sign);
          }
        }
      }
    }
  }

  count() {
    return this.parkingSigns.length;
  }

  update() {
    this.parkingSigns.forEach(sign => sign.update());
  }
};