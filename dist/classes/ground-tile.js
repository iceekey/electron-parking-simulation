'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = require('lodash');

var _require = require('./../config'),
    groundRect = _require.groundRect,
    grid = _require.grid;

var StageBehaviourObject = require('./stage-behaviour-object');

module.exports = function (_StageBehaviourObject) {
  _inherits(GroundTile, _StageBehaviourObject);

  function GroundTile(stage, x, y) {
    _classCallCheck(this, GroundTile);

    var _this = _possibleConstructorReturn(this, (GroundTile.__proto__ || Object.getPrototypeOf(GroundTile)).call(this, stage));

    var data = {
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

    _this.sheet = new createjs.SpriteSheet(data);
    _this.sprite = new createjs.Sprite(_this.sheet, 'empty');

    _this.sprite.scaleX = 1;
    _this.sprite.scaleY = 1;

    _this.x = x;
    _this.y = y;

    _this.behaviour = null;

    _this.stage.selector.changeStream.subscribe(function (changed) {
      _this.behaviour = null;
    });
    return _this;
  }

  _createClass(GroundTile, [{
    key: 'checkHit',
    value: function checkHit(offsetX, offsetY) {
      var position = this.sprite.globalToLocal(offsetX, offsetY);
      return this.sprite.hitTest(position.x, position.y);
    }
  }, {
    key: 'isParkingPlace',
    value: function isParkingPlace() {
      return this.stage.ground.grid[this.y][this.x] < 0;
    }
  }, {
    key: 'isRoad',
    value: function isRoad() {
      return this.stage.ground.grid[this.y][this.x] > 0;
    }
  }, {
    key: 'checkBehaviour',
    value: function checkBehaviour() {
      if (this.behaviour !== null) {
        return this.behaviour;
      }

      var roadsAround = 0,
          ppsAround = 0;
      var ground = this.stage.ground;
      var topIsRoad = void 0,
          bottomIsRoad = void 0,
          rightIsRoad = void 0,
          leftIsRoad = void 0,
          topIsPP = void 0,
          bottomIsPP = void 0,
          rightIsPP = void 0,
          leftIsPP = void 0;

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

      var behaviour = {
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
  }, {
    key: 'bindedPPCount',
    value: function bindedPPCount() {
      var ground = this.stage.ground,
          bindedCount = 0;
      var topIsBinded = false,
          leftIsBinded = false,
          rightIsBinded = false,
          bottomIsBinded = false;

      var _checkBehaviour = this.checkBehaviour(),
          leftIsRoad = _checkBehaviour.leftIsRoad,
          topIsPP = _checkBehaviour.topIsPP,
          bottomIsPP = _checkBehaviour.bottomIsPP,
          leftIsPP = _checkBehaviour.leftIsPP,
          rightIsPP = _checkBehaviour.rightIsPP;

      if (topIsPP) {
        var _ground$getOrBindPP = ground.getOrBindPP(this.x, this.y - 1),
            x = _ground$getOrBindPP.x,
            y = _ground$getOrBindPP.y;

        if (x === this.x && y === this.y) {
          topIsBinded = true;
          bindedCount++;
        }
      }

      if (bottomIsPP) {
        var _ground$getOrBindPP2 = ground.getOrBindPP(this.x, this.y + 1),
            _x = _ground$getOrBindPP2.x,
            _y = _ground$getOrBindPP2.y;

        if (_x === this.x && _y === this.y) {
          bottomIsBinded = true;
          bindedCount++;
        }
      }

      if (leftIsPP) {
        var _ground$getOrBindPP3 = ground.getOrBindPP(this.x - 1, this.y),
            _x2 = _ground$getOrBindPP3.x,
            _y2 = _ground$getOrBindPP3.y;

        if (_x2 === this.x && _y2 === this.y) {
          leftIsBinded = true;
          bindedCount++;
        }
      }

      if (rightIsPP) {
        var _ground$getOrBindPP4 = ground.getOrBindPP(this.x + 1, this.y),
            _x3 = _ground$getOrBindPP4.x,
            _y3 = _ground$getOrBindPP4.y;

        if (_x3 === this.x && _y3 === this.y) {
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
  }, {
    key: 'getOrBindPP',
    value: function getOrBindPP() {
      var _checkBehaviour2 = this.checkBehaviour(),
          topIsRoad = _checkBehaviour2.topIsRoad,
          rightIsRoad = _checkBehaviour2.rightIsRoad,
          bottomIsRoad = _checkBehaviour2.bottomIsRoad,
          leftIsRoad = _checkBehaviour2.leftIsRoad;

      if (leftIsRoad) {
        this.sprite.gotoAndStop('parkingNorth');
        return { x: this.x - 1, y: this.y };
      }

      if (rightIsRoad) {
        this.sprite.gotoAndStop('parkingSouth');
        return { x: this.x + 1, y: this.y };
      }

      if (topIsRoad) {
        this.sprite.gotoAndStop('parkingEast');
        return { x: this.x, y: this.y - 1 };
      }

      this.sprite.gotoAndStop('parkingWest');
      return { x: this.x, y: this.y + 1 };
    }
  }, {
    key: 'updateRoadSprite',
    value: function updateRoadSprite() {
      var _checkBehaviour3 = this.checkBehaviour(),
          roadsAround = _checkBehaviour3.roadsAround,
          ppsAround = _checkBehaviour3.ppsAround,
          topIsRoad = _checkBehaviour3.topIsRoad,
          rightIsRoad = _checkBehaviour3.rightIsRoad,
          bottomIsRoad = _checkBehaviour3.bottomIsRoad,
          leftIsRoad = _checkBehaviour3.leftIsRoad;

      var _bindedPPCount = this.bindedPPCount(),
          bindedCount = _bindedPPCount.bindedCount,
          topIsBinded = _bindedPPCount.topIsBinded,
          leftIsBinded = _bindedPPCount.leftIsBinded,
          rightIsBinded = _bindedPPCount.rightIsBinded,
          bottomIsBinded = _bindedPPCount.bottomIsBinded;

      if (roadsAround === 4) {
        this.sprite.gotoAndStop('cross');
        return;
      }

      if (roadsAround === 3) {
        if (!leftIsRoad) {
          if (leftIsBinded) {
            this.sprite.gotoAndStop('cross');
          } else {
            this.sprite.gotoAndStop('twSouth');
          }
          return;
        }

        if (!rightIsRoad) {
          if (rightIsBinded) {
            this.sprite.gotoAndStop('cross');
          } else {
            this.sprite.gotoAndStop('twNorth');
          }
          return;
        }

        if (!topIsRoad) {
          if (topIsBinded) {
            this.sprite.gotoAndStop('cross');
          } else {
            this.sprite.gotoAndStop('twEast');
          }
          return;
        }

        if (bottomIsBinded) {
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

          if (leftIsBinded) {
            this.sprite.gotoAndStop('twNorth');
            return;
          }

          if (rightIsBinded) {
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
            if (leftIsBinded) {
              this.sprite.gotoAndStop('twEast');
              return;
            }

            if (topIsBinded) {
              this.sprite.gotoAndStop('twSouth');
              return;
            }

            this.sprite.gotoAndStop('turnEast');
            return;
          }

          if (bottomIsRoad && leftIsRoad) {
            if (rightIsBinded) {
              this.sprite.gotoAndStop('twEast');
              return;
            }

            if (topIsBinded) {
              this.sprite.gotoAndStop('twNorth');
              return;
            }

            this.sprite.gotoAndStop('turnSouth');
            return;
          }

          if (topIsRoad && rightIsRoad) {
            if (leftIsBinded) {
              this.sprite.gotoAndStop('twWest');
              return;
            }

            if (bottomIsBinded) {
              this.sprite.gotoAndStop('twSouth');
              return;
            }

            this.sprite.gotoAndStop('turnNorth');
            return;
          }

          if (bottomIsBinded) {
            this.sprite.gotoAndStop('twNorth');
            return;
          }

          if (rightIsBinded) {
            this.sprite.gotoAndStop('twWest');
            return;
          }

          this.sprite.gotoAndStop('turnWest');
          return;
        }
      }

      if (roadsAround === 2 && leftIsRoad && rightIsRoad) {
        if (bindedCount === 2) {
          this.sprite.gotoAndStop('cross');
          return;
        }

        if (topIsBinded) {
          this.sprite.gotoAndStop('twWest');
          return;
        }

        if (bottomIsBinded) {
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
          if (bottomIsBinded && leftIsBinded) {
            this.sprite.gotoAndStop('twNorth');
            return;
          }

          if (bottomIsBinded && rightIsBinded) {
            this.sprite.gotoAndStop('twSouth');
            return;
          }

          if (leftIsBinded && rightIsBinded) {
            this.sprite.gotoAndStop('twWest');
            return;
          }
        }

        if (bottomIsRoad) {
          if (topIsBinded && leftIsBinded) {
            this.sprite.gotoAndStop('twNorth');
            return;
          }

          if (topIsBinded && rightIsBinded) {
            this.sprite.gotoAndStop('twSouth');
            return;
          }

          if (leftIsBinded && rightIsBinded) {
            this.sprite.gotoAndStop('twEast');
            return;
          }
        }

        if (leftIsRoad) {
          if (bottomIsBinded && rightIsBinded) {
            this.sprite.gotoAndStop('twEast');
            return;
          }

          if (topIsBinded && rightIsBinded) {
            this.sprite.gotoAndStop('twWest');
            return;
          }

          if (topIsBinded && bottomIsBinded) {
            this.sprite.gotoAndStop('twNorth');
            return;
          }
        }

        if (rightIsRoad) {
          if (topIsBinded && leftIsBinded) {
            this.sprite.gotoAndStop('twWest');
            return;
          }

          if (topIsBinded && bottomIsBinded) {
            this.sprite.gotoAndStop('twSouth');
            return;
          }

          if (bottomIsBinded && leftIsBinded) {
            this.sprite.gotoAndStop('twEast');
            return;
          }
        }
      }

      if (bindedCount === 1) {
        if (topIsRoad) {
          if (leftIsBinded && leftIsBinded) {
            this.sprite.gotoAndStop('turnWest');
            return;
          }

          if (rightIsBinded && rightIsBinded) {
            this.sprite.gotoAndStop('turnNorth');
            return;
          }
        }

        if (leftIsRoad) {
          if (topIsBinded) {
            this.sprite.gotoAndStop('turnWest');
            return;
          }

          if (bottomIsBinded) {
            this.sprite.gotoAndStop('turnSouth');
            return;
          }
        }

        if (rightIsRoad) {
          if (topIsBinded) {
            this.sprite.gotoAndStop('turnNorth');
            return;
          }

          if (bottomIsBinded) {
            this.sprite.gotoAndStop('turnEast');
            return;
          }
        }

        if (bottomIsRoad) {
          if (leftIsBinded) {
            this.sprite.gotoAndStop('turnSouth');
            return;
          }

          if (rightIsBinded) {
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
  }, {
    key: 'update',
    value: function update() {
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
  }, {
    key: 'forStage',
    value: function forStage() {
      return this.sprite;
    }
  }, {
    key: 'width',
    get: function get() {
      return groundRect.width - 10;
    }
  }, {
    key: 'height',
    get: function get() {
      return groundRect.height - 25;
    }
  }, {
    key: 'dx',
    get: function get() {
      return this.width / 2 + this.x * this.width / 2 + this.y * this.width / 2;
    }
  }, {
    key: 'dy',
    get: function get() {
      return 10 + this.height * grid.rows / 2 + this.y * this.height / 2 - this.x * this.height / 2;
    }
  }, {
    key: 'shift',
    get: function get() {
      return {
        dx: this.dx + groundRect.xShift,
        dy: this.dy + groundRect.yShift
      };
    }
  }]);

  return GroundTile;
}(StageBehaviourObject);