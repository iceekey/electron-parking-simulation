let _ = require('underscore');
let Rx = require('rxjs');

let Ground = require('./ground');
let Selector = require('./selector');
let StageBase = require('./stage-base');
let CarManager = require('./car-manager');
let IssueManager = require('./issue-manager');
let ParkingManager = require('./parking-manager');
let BehaviourManager = require('./behaviour-manager');

class Stage extends StageBase {
  constructor() {
    super();
    this.core = null;
    this.draw = new createjs.Stage('surface');

    this.ground = null;
    this.selector = null;
    this.carManager = null;
    this.behaviourManager = null;
    this.running = false;
    this.runStream = new Rx.Subject();
  }

  init(core) {
    this.core = core;

    this.selector = new Selector(this);

    this.ground = new Ground(this);
    this.addBehaviourObject(this.ground);

    this.carManager = new CarManager(this);
    this.parkingManager = new ParkingManager(this);

    this.issueManager = new IssueManager(this);
    this.behaviourManager = new BehaviourManager(this);
    this.addBehaviourObject(this.selector, this.ground.count());
  }

  start() {
    this.running = true;
    this.runStream.next(this.running);
  }

  stop() {
    this.running = false;
    this.runStream.next(this.running);
  }

  addBehaviourObject(obj, index) {
    let stageObject = obj.forStage();
    if (_.isArray(stageObject)) {
      this.draw.addChild.apply(this.draw, stageObject);
    } else {
      if (_.isNumber(index)) {
        this.draw.addChildAt(stageObject, index);
      } else {
        this.draw.addChild(stageObject);
      }
    }
  }

  removeBehaviourObject(obj) {
    if (_.isFunction(obj.forStageRemove)) {
      obj.forStageRemove().then(stageObject => {
        if (_.isArray(stageObject)) {
          this.draw.removeChild.apply(this.draw, stageObject);
        } else {
          this.draw.removeChild(stageObject);
        }
      });
      return;
    }

    let stageObject = obj.forStage();
    if (_.isArray(stageObject)) {
      this.draw.removeChild.apply(this.draw, stageObject);
    } else {
      this.draw.removeChild(stageObject);
    }
  }

  tick(time) {
    this.carManager.tick();
    this.parkingManager.tick();
  }

  update(time) {
    this.ground.update();
    this.selector.update();
    this.issueManager.update();
    this.carManager.update();
    this.behaviourManager.update();
    this.draw.update();
  }

  get width() {
    return document.getElementById('surface').offsetWidth;
  }

  get height() {
    return document.getElementById('surface').offsetHeight;
  }
}

module.exports = new Stage();