let _ = require('lodash');
let {groundRect, grid} = require('./../config');
let StageBehaviourObject = require('./stage-behaviour-object');

module.exports = class GroundTile extends StageBehaviourObject {
  constructor(stage, x, y) {
    super(stage);

    let data = {
      images: [stage.core.assets.getResult('GROUND')],
      frames: {
        width: groundRect.width,
        height: groundRect.height,
        count: 16,
        spacing: 0,
        margin: 0,
        regX: groundRect.width / 2,
        regY: groundRect.height / 2
      },
      animations: {
        cross: 0,
        empty: 1,
        turnEast: 2,
        turnNorth: 3,
        turnWest: 4,
        turnSouth: 5,
        straightEast: 6,
        parkingSouth: 7,
        parkingEast: 8,
        parkingWest: 9,
        parkingNorth: 10,
        straightWest: 11,
        twSouth: 12,
        twEast: 14,
        twWest: 13,
        twNorth: 15
      }
    };

    this.sheet = new createjs.SpriteSheet(data);
    this.sprite = new createjs.Sprite(this.sheet, 'empty');

    this.sprite.scaleX = 1;
    this.sprite.scaleY = 1;

    this.x = x;
    this.y = y;

    this.behaviour = null;

    this.stage.selector.changeStream.subscribe(changed => {
      this.behaviour = null;
    });
  }

  get width() {
    return groundRect.width - 10;
  }

  get height() {
    return groundRect.height - 25;
  }

  get dx() {
    return this.width / 2 + this.x * this.width / 2 + this.y * this.width / 2;
  }

  get dy() {
    return 10 + this.height * grid.rows / 2 + this.y * this.height / 2 - this.x * this.height / 2;
  }

  get shift() {
    return {
      dx: this.dx + groundRect.xShift,
      dy: this.dy + groundRect.yShift
    };
  }

  checkHit(offsetX, offsetY) {
    let position = this.sprite.globalToLocal(offsetX, offsetY);
    return this.sprite.hitTest(position.x, position.y);
  }

  isParkingPlace() {
    return this.stage.ground.grid[this.y][this.x] < 0;
  }

  isRoad() {
    return this.stage.ground.grid[this.y][this.x] > 0;
  }

  checkBehaviour() {
    if (this.behaviour !== null) {
      return this.behaviour;
    }

    let roadsAround = 0, ppsAround = 0;
    let ground = this.stage.ground;
    let topIsRoad, bottomIsRoad, rightIsRoad, leftIsRoad,
      topIsPP, bottomIsPP, rightIsPP, leftIsPP;

    if (bottomIsRoad = ground.isRoad(this.x, this.y + 1)) {
      roadsAround++;
    }

    if (bottomIsPP = ground.isParkingPlace(this.x, this.y + 1)) {
      ppsAround++;
    }
    if (topIsRoad = ground.isRoad(this.x, this.y - 1)) {
      roadsAround++;
    }

    if (topIsPP = ground.isParkingPlace(this.x, this.y - 1)) {
      ppsAround++;
    }

    if (rightIsRoad = ground.isRoad(this.x + 1, this.y)) {
      roadsAround++;
    }

    if (rightIsPP = ground.isParkingPlace(this.x + 1, this.y)) {
      ppsAround++;
    }

    if (leftIsRoad = ground.isRoad(this.x - 1, this.y)) {
      roadsAround++;
    }

    if (leftIsPP = ground.isParkingPlace(this.x - 1, this.y)) {
      ppsAround++;
    }

    if (this.x === grid.columns - 1 && this.y === grid.rows) {
      roadsAround++;
      rightIsRoad = true;
    }

    if (this.x === 0 && this.y === grid.rows) {
      roadsAround++;
      leftIsRoad = true;
    }

    let behaviour = {
      roadsAround: roadsAround,
      ppsAround: ppsAround,
      topIsRoad: topIsRoad,
      rightIsRoad: rightIsRoad,
      bottomIsRoad: bottomIsRoad,
      leftIsRoad: leftIsRoad,
      topIsPP: topIsPP,
      rightIsPP: rightIsPP,
      bottomIsPP: bottomIsPP,
      leftIsPP: leftIsPP
    };

    this.behaviour = behaviour;
    return behaviour;
  }

  bindedPPCount() {
    let ground = this.stage.ground, bindedCount = 0;
    let topIsBinded = false, leftIsBinded = false, rightIsBinded = false, bottomIsBinded = false;
    let {leftIsRoad, topIsPP, bottomIsPP, leftIsPP, rightIsPP} = this.checkBehaviour();

    if (topIsPP) {
      let {x, y} = ground.getOrBindPP(this.x, this.y - 1);
      if  (x === this.x && y === this.y) {
        topIsBinded = true;
        bindedCount++;
      }
    }

    if (bottomIsPP) {
      let {x, y} = ground.getOrBindPP(this.x, this.y + 1);
      if (x === this.x && y === this.y) {
        bottomIsBinded = true;
        bindedCount++;
      }
    }

    if (leftIsPP) {
      let {x, y} = ground.getOrBindPP(this.x - 1, this.y);
      if (x === this.x && y === this.y) {
        leftIsBinded = true;
        bindedCount++;
      }
    }

    if (rightIsPP) {
      let {x, y} = ground.getOrBindPP(this.x + 1, this.y);
      if (x === this.x && y === this.y) {
        rightIsBinded = true;
        bindedCount++;
      }
    }

    return {
      bindedCount: bindedCount,
      topIsBinded: topIsBinded,
      bottomIsBinded: bottomIsBinded,
      leftIsBinded: leftIsBinded,
      rightIsBinded: rightIsBinded
    };
  }

  getOrBindPP() {
    let {topIsRoad, rightIsRoad, bottomIsRoad, leftIsRoad} = this.checkBehaviour();

    if (leftIsRoad) {
      this.sprite.gotoAndStop('parkingNorth');
      return {x: this.x - 1, y: this.y};
    }

    if (rightIsRoad) {
      this.sprite.gotoAndStop('parkingSouth');
      return {x: this.x + 1, y: this.y};
    }

    if (topIsRoad) {
      this.sprite.gotoAndStop('parkingEast');
      return {x: this.x, y: this.y - 1};
    }

    this.sprite.gotoAndStop('parkingWest');
    return {x: this.x, y: this.y + 1};
  }

  updateRoadSprite() {
    let {roadsAround, ppsAround, topIsRoad, rightIsRoad, bottomIsRoad,
      leftIsRoad, topIsPP, bottomIsPP, leftIsPP, rightIsPP} = this.checkBehaviour();

    let {bindedCount, topIsBinded, leftIsBinded, rightIsBinded, bottomIsBinded} = this.bindedPPCount();

    if (roadsAround === 4) {
      this.sprite.gotoAndStop('cross');
      return;
    }

    if (roadsAround === 3) {
      if (!leftIsRoad) {
        if (leftIsPP && leftIsBinded) {
          this.sprite.gotoAndStop('cross');
        } else {
          this.sprite.gotoAndStop('twSouth');
        }
        return;
      }

      if (!rightIsRoad) {
        if (rightIsPP && rightIsBinded) {
          this.sprite.gotoAndStop('cross');
        } else {
          this.sprite.gotoAndStop('twNorth');
        }
        return;
      }

      if (!topIsRoad) {
        if (topIsPP && topIsBinded) {
          this.sprite.gotoAndStop('cross');
        } else {
          this.sprite.gotoAndStop('twEast');
        }
        return;
      }

      if (bottomIsPP && bottomIsBinded) {
        this.sprite.gotoAndStop('cross');
      } else {
        this.sprite.gotoAndStop('twWest');
      }
      return;
    }

    if (roadsAround === 2 && !(leftIsRoad && rightIsRoad)) {
      if (topIsRoad && bottomIsRoad) {
        if (bindedCount === 2) {
          this.sprite.gotoAndStop('cross');
          return;
        }

        if (leftIsPP && leftIsBinded) {
          this.sprite.gotoAndStop('twNorth');
          return;
        }

        if (rightIsPP && rightIsBinded) {
          this.sprite.gotoAndStop('twSouth');
          return;
        }

        this.sprite.gotoAndStop('straightWest');
        return;
      } else {
        if (bindedCount === 2) {
          this.sprite.gotoAndStop('cross');
          return;
        }

        if (bottomIsRoad && rightIsRoad) {
          if (leftIsPP && leftIsBinded) {
            this.sprite.gotoAndStop('twEast');
            return;
          }

          if (topIsPP && topIsBinded) {
            this.sprite.gotoAndStop('twSouth');
            return;
          }

          this.sprite.gotoAndStop('turnEast');
          return;
        }

        if (bottomIsRoad && leftIsRoad) {
          if (rightIsPP && rightIsBinded) {
            this.sprite.gotoAndStop('twEast');
            return;
          }

          if (topIsPP && topIsBinded) {
            this.sprite.gotoAndStop('twNorth');
            return;
          }

          this.sprite.gotoAndStop('turnSouth');
          return;
        }

        if (topIsRoad && rightIsRoad) {
          if (leftIsPP && leftIsBinded) {
            this.sprite.gotoAndStop('twWest');
            return;
          }

          if (bottomIsPP && bottomIsBinded) {
            this.sprite.gotoAndStop('twSouth');
            return;
          }

          this.sprite.gotoAndStop('turnNorth');
          return;
        }

        if (bottomIsPP && bottomIsBinded) {
          this.sprite.gotoAndStop('twNorth');
          return;
        }

        if (rightIsPP && rightIsBinded) {
          this.sprite.gotoAndStop('twWest');
          return;
        }

        this.sprite.gotoAndStop('turnWest');
        return;
      }
    }

    if (roadsAround === 2 && (leftIsRoad && rightIsRoad)) {
      if (bindedCount === 2) {
        this.sprite.gotoAndStop('cross');
        return;
      }

      if (topIsPP && topIsBinded) {
        this.sprite.gotoAndStop('twWest');
        return;
      }

      if (bottomIsPP && bottomIsBinded) {
        this.sprite.gotoAndStop('twEast');
        return;
      }

      this.sprite.gotoAndStop('straightEast');
      return;
    }

    // roadsAround === 1
    if (bindedCount === 3) {
      this.sprite.gotoAndStop('cross');
      return;
    }

    if (bindedCount === 2) {
      if (topIsRoad) {
        if (bottomIsPP && leftIsPP) {
          this.sprite.gotoAndStop('twNorth');
          return;
        }

        if (bottomIsPP && rightIsPP) {
          this.sprite.gotoAndStop('twSouth');
          return;
        }

        if (leftIsPP && rightIsPP) {
          this.sprite.gotoAndStop('twWest');
          return;
        }
      }

      if (bottomIsRoad) {
        if (topIsPP && leftIsPP) {
          this.sprite.gotoAndStop('twNorth');
          return;
        }

        if (topIsPP && rightIsPP) {
          this.sprite.gotoAndStop('twSouth');
          return;
        }

        if (leftIsPP && rightIsPP) {
          this.sprite.gotoAndStop('twEast');
          return;
        }
      }

      if (leftIsRoad) {
        if (bottomIsPP && rightIsPP) {
          this.sprite.gotoAndStop('twEast');
          return;
        }

        if (topIsPP && rightIsPP) {
          this.sprite.gotoAndStop('twWest');
          return;
        }

        if (topIsPP && bottomIsPP) {
          this.sprite.gotoAndStop('twNorth');
          return;
        }
      }

      if (rightIsRoad) {
        if (topIsPP && leftIsPP) {
          this.sprite.gotoAndStop('twWest');
          return;
        }

        if (topIsPP && bottomIsPP) {
          this.sprite.gotoAndStop('twSouth');
          return;
        }

        if (bottomIsPP && leftIsPP) {
          this.sprite.gotoAndStop('twEast');
          return;
        }
      }
    }

    if (bindedCount === 1) {
      if (topIsRoad) {
        if (leftIsPP && leftIsBinded) {
          this.sprite.gotoAndStop('turnWest');
          return;
        }

        if (rightIsPP && rightIsBinded) {
          this.sprite.gotoAndStop('turnNorth');
          return;
        }
      }

      if (leftIsRoad) {
        if (topIsPP && topIsBinded) {
          this.sprite.gotoAndStop('turnWest');
          return;
        }

        if (bottomIsPP && bottomIsBinded) {
          this.sprite.gotoAndStop('turnSouth');
          return;
        }
      }

      if (rightIsRoad) {
        if (topIsPP && topIsBinded) {
          this.sprite.gotoAndStop('turnNorth');
          return;
        }

        if (bottomIsPP && bottomIsBinded) {
          this.sprite.gotoAndStop('turnEast');
          return;
        }
      }

      if (bottomIsRoad) {
        if (leftIsPP && leftIsBinded) {
          this.sprite.gotoAndStop('turnSouth');
          return;
        }

        if (rightIsPP && rightIsBinded) {
          this.sprite.gotoAndStop('turnEast');
          return;
        }
      }
    }

    if (leftIsRoad || rightIsRoad) {
      this.sprite.gotoAndStop('straightEast');
    } else {
      this.sprite.gotoAndStop('straightWest');
    }
  }

  update() {
    if (this.isRoad()) {
      this.updateRoadSprite();
    }

    if (this.isParkingPlace()) {
      this.getOrBindPP();
    }

    if (!this.isRoad() && !this.isParkingPlace()) {
      this.sprite.gotoAndStop('empty');
    }

    this.sprite.x = this.dx;
    this.sprite.y = this.dy;
  }

  forStage() {
    return this.sprite;
  }
};