let {grid, defaultGrid} = require('./../config');
let _ = require('lodash');

let GroundTile = require('./ground-tile');
let HighwayTile = require('./highway-tile');
let StageBehaviourObject = require('./stage-behaviour-object');

module.exports = class Ground extends StageBehaviourObject {
  constructor(stage) {
    super(stage);

    this.grid = defaultGrid;
    this.stage = stage;
    this.tiles = [];

    // Create tiles from default grid
    for (let i = 0; i < grid.rows; i++) {
      for (let j = 0; j < grid.columns; j++) {
        if (!_.isArray(this.tiles[i])) {
          this.tiles[i] = [];
        }

        this.tiles[i][j] = new GroundTile(this.stage, j, i);
      }
    }

    // Create highway
    let highway = [];
    let highwayGrid = [];
    let highwayRow = this.tiles.length;
    for (let i = 0; i < grid.columns; i++) {
      highwayGrid[i] = 1;
      highway[i] = new HighwayTile(this.stage, i, highwayRow);
    }

    this.tiles.push(highway);
    this.grid.push(highwayGrid);
  }

  count() {
    return grid.columns * (grid.rows + 1);
  }

  findIn() {
    for(let i = 0; i < grid.columns; i++) {
      let tile = this.tiles[grid.rows - 1][i];
      if (tile.isRoad()) {
        return {
          x: tile.x,
          y: tile.y
        };
      }
    }

    return null;
  }

  findOut() {
    for(let i = grid.columns - 1; i >= 0 ; i--) {
      let tile = this.tiles[grid.rows - 1][i];
      if (tile.isRoad()) {
        return {
          x: tile.x,
          y: tile.y
        };
      }
    }

    return null;
  }

  isRoad(x, y) {
    if (x >= grid.columns || y >= grid.rows + 1 || x < 0 || y < 0) {
      return false;
    }

    return this.tiles[y][x].isRoad();
  }

  isParkingPlace(x, y) {
    if (x >= grid.columns || y >= grid.rows + 1 || x < 0 || y < 0) {
      return false;
    }

    return this.tiles[y][x].isParkingPlace();
  }

  checkBehaviour(x, y) {
    if (x >= grid.columns || y >= grid.rows + 1 || x < 0 || y < 0) {
      return false;
    }

    return this.tiles[y][x].checkBehaviour();
  }

  getOrBindPP(x, y) {
    if (x >= grid.columns || y >= grid.rows + 1 || x < 0 || y < 0) {
      return {x: -1, y: -1};
    }

    return this.tiles[y][x].getOrBindPP();
  }

  bindedPPCount(x, y) {
    if (x >= grid.columns || y >= grid.rows + 1 || x < 0 || y < 0) {
      return {x: -1, y: -1};
    }

    return this.tiles[y][x].bindedPPCount();
  }

  isExit(x, y) {
    return x === grid.columns - 1 && y == grid.rows;
  }

  getShift(x, y) {
    let tile = this.tiles[y][x] || null;
    return tile ? tile.shift : {dx: 0, dy: 0};
  }

  update() {
    this.tiles.forEach(tilesRow => tilesRow.forEach(tile => tile.update()));
  }

  forStage() {
    let groundRowsForStage = this.tiles.map(tilesRow => {
      return tilesRow.map(tile => tile.forStage()).reverse();
    });

    return Array.prototype.concat.apply([], groundRowsForStage);
  }
};

