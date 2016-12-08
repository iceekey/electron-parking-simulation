let {grid} = require('./../config');
let StageBehaviourObject = require('./stage-behaviour-object');
let Issue = require('./issue');

let PF = require('@screeps/pathfinding');

module.exports = class IssueManager extends StageBehaviourObject {
  constructor(stage) {
    super(stage);
    this.issues = [];
    this.finder = new PF.AStarFinder();
    this.updateIssues();

    this.stage.runStream.subscribe(running => {
      this.issues.forEach(issue => this.stage.removeBehaviourObject(issue));
      this.issues = [];

      if (!running) {
        this.updateIssues();
      }
    });

    this.stage.selector.changeStream.subscribe(this.updateIssues.bind(this));
  }

  updateIssues() {
    this.issues.forEach(issue => this.stage.removeBehaviourObject(issue));
    this.issues = [];

    let ground = this.stage.ground;

    let parkingIn = ground.findIn();
    let parkingOut = ground.findOut();

    if (parkingIn !== null && parkingOut !== null) {
      // Въезд на парковку не должен совпадать с выездом
      if (parkingIn.x == parkingOut.x && parkingIn.y === parkingOut.y) {
        this.addIssue(parkingIn.x, parkingIn.y);
      }

      // Должен быть только въезд и выезд
      for (let i = 0; i < grid.columns; i++) {
        let tile = ground.tiles[grid.rows - 1][i];
        if (tile.isRoad() && (tile.x !== parkingIn.x && tile.x !== parkingOut.x)) {
          this.addIssue(tile.x, tile.y);
        }
      }
    }

    // Парковки не должны стоять на шоссе
    for (let i = 0; i < grid.columns; i++) {
      let tile = ground.tiles[grid.rows][i];
      let {bindedCount} = tile.bindedPPCount();
      if (bindedCount > 0) {
        this.addIssue(tile.x, tile.y);
      }
    }

    for (let i = 0; i < grid.rows; i++) {
      for (let j = 0; j < grid.columns; j++) {
        let {roadsAround} = ground.checkBehaviour(j, i);
        let {bindedCount} = ground.bindedPPCount(j, i);

        // Проверка на то, что все тайлы дороги имеют минимум 2 дорооги по краям
        if (ground.isRoad(j, i)) {
          if (roadsAround + bindedCount < 2) {
            this.addIssue(j, i);
            continue;
          }

          // Можно доехать до этой клетки от стартовой
          let path = this.finder.findPath(0, grid.rows, j, i, this.stage.carManager.getMatrix(j, i, false, true));
          let last = path[path.length - 1];
          if (last[0] !== j || last[1] !== i) {
            this.addIssue(j, i);
            continue;
          }

          // Можно доехать от этой клетки до итоговой
          let matrix = this.stage.carManager.getMatrix(null, null, true);
          path = this.finder.findPath(j, i, grid.columns - 1, grid.rows, matrix);
          last = path[path.length - 1];
          if (last[0] !== grid.columns - 1 || last[1] !== grid.rows) {
            this.addIssue(j, i);
            continue;
          }
        }
        // Все парковки должны быть прикреплены к одной дороге
        if (ground.isParkingPlace(j, i)) {
          if (roadsAround < 1) {
            this.addIssue(j, i);
            continue;
          }
        }
      }
    }

    for (let i = 0; i < grid.rows; i++) {
      for (let j = 0; j < grid.columns; j++) {
        if (ground.isParkingPlace(j, i)) {
          let binded = ground.getOrBindPP(j, i);
          if(this.issues.some(issue => issue.x === binded.x && issue.y === binded.y)) {
            this.addIssue(j, i);
          }
        }
      }
    }
  }

  addIssue(x, y) {
    let issue = new Issue(this.stage, x, y);
    this.stage.addBehaviourObject(issue, this.stage.draw.getChildIndex(this.stage.selector.forStage()));
    this.issues.push(issue);
  }

  update() {
    this.issues.forEach(issue => issue.update());
  }

  get valid() {
    return this.issues.length === 0;
  }
};
