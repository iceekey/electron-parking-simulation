let {grid, groundRect} = require('./../config');
let StageBehaviourObject = require('./stage-behaviour-object');
let GroundTile = require('./ground-tile');

let Rx = require('rxjs');

module.exports = class Selector extends StageBehaviourObject {
  constructor(stage) {
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

    this.sheet = new createjs.SpriteSheet(data);
    this.sprite = new createjs.Sprite(this.sheet, 'default');

    this.sprite.scaleX = 1;
    this.sprite.scaleY = 1;

    this.selected = null;
    this.selectedCache = null;
    this.groundSelected = null;
    this.changeStream = new Rx.Subject();

    this.stage.runStream.subscribe(running => {
      if (this.selected !== null && this.selectedCache !== null) {
        this.stage.ground.grid[this.selected.y][this.selected.x] = this.selectedCache;
        this.changeStream.next(this.selected);
      }

      this.sprite.visible = false;
      this.selected = null;
      this.selectedCache = null;
      this.groundSelected = 'grass';

      $('.tile').removeClass('active');
      $('#grass').addClass('active');
    });

    let self = this;
    $('.tile').click(function() {
      let $tile = $(this);

      $('.tile').removeClass('active');
      $tile.addClass('active');

      self.groundSelected = $tile.attr('id');
    });

    $('#surface').click(e => {
      if (this.stage.running || !this.selected) {
        return;
      }

      let selected = this.selected;
      let ground = this.stage.ground;
      switch(this.groundSelected) {
      case 'parking':
        ground.grid[selected.y][selected.x] = -1;
        break;
      case 'road':
        ground.grid[selected.y][selected.x] = 1;
        break;
      default:
        ground.grid[selected.y][selected.x] = 0;
      };

      this.selectedCache = null;
    });

    $('#surface').mousemove(e => {
      if (this.stage.running) {
        return;
      }
      // find owner
      let offsetX = e.offsetX;
      let offsetY = e.offsetY;
      let tiles = this.stage.ground.tiles;

      let closest = null;
      for (let i = 0; i < grid.rows; i++) {
        for (let j = 0; j < grid.columns; j++) {
          if (tiles[i][j].checkHit(offsetX, offsetY)) {
            let tile = tiles[i][j];
            if (closest === null) {
              closest = tile;
              continue;
            }

            let shift = tile.shift;
            let closestShift = closest.shift;
            let summ = offsetX + shift.dx + offsetY + shift.dy;
            let closestSumm = offsetX + closestShift.dx + offsetY + closestShift.dy;
            if (summ < closestSumm) {
              closest = tile;
            }
          }
        }
      }

      if (closest === null) {
        this.sprite.visible = false;
      } else {
        this.sprite.visible = true;
      }

      if (closest === null && this.selected !== null && this.selectedCache !== null) {
        this.stage.ground.grid[this.selected.y][this.selected.x] = this.selectedCache;
        this.changeStream.next(this.selected);
      }

      if (closest !== null && this.selected !== closest) {
        let ground = this.stage.ground;

        if (this.selected !== null && this.selectedCache !== null) {
          ground.grid[this.selected.y][this.selected.x] = this.selectedCache;
          this.changeStream.next(this.selected);
        }

        this.selectedCache = ground.grid[closest.y][closest.x];

        switch(this.groundSelected) {
        case 'parking':
          ground.grid[closest.y][closest.x] = -1;
          break;
        case 'road':
          ground.grid[closest.y][closest.x] = 1;
          break;
        default:
          ground.grid[closest.y][closest.x] = 0;
        };

        this.selected = closest;
        this.changeStream.next(this.selected);
      }
    });
  }

  // mouseMoveHandler() {
  // }

  update() {
    if (this.selected !== null) {
      let shift = this.selected.shift;
      this.sprite.x = shift.dx - groundRect.xShift;
      this.sprite.y = shift.dy - groundRect.yShift;
    }
  }

  forStage() {
    return this.sprite;
  }
};