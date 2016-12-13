'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = require('underscore');
var Rx = require('rxjs');

var Ground = require('./ground');
var Selector = require('./selector');
var StageBase = require('./stage-base');
var CarManager = require('./car-manager');
var IssueManager = require('./issue-manager');
var ParkingManager = require('./parking-manager');
var BehaviourManager = require('./behaviour-manager');

var Stage = function (_StageBase) {
  _inherits(Stage, _StageBase);

  function Stage() {
    _classCallCheck(this, Stage);

    var _this = _possibleConstructorReturn(this, (Stage.__proto__ || Object.getPrototypeOf(Stage)).call(this));

    _this.core = null;
    _this.draw = new createjs.Stage('surface');

    _this.ground = null;
    _this.selector = null;
    _this.carManager = null;
    _this.behaviourManager = null;
    _this.running = false;
    _this.runStream = new Rx.Subject();
    return _this;
  }

  _createClass(Stage, [{
    key: 'init',
    value: function init(core) {
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
  }, {
    key: 'start',
    value: function start() {
      this.running = true;
      this.runStream.next(this.running);
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.running = false;
      this.runStream.next(this.running);
    }
  }, {
    key: 'addBehaviourObject',
    value: function addBehaviourObject(obj, index) {
      var stageObject = obj.forStage();
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
  }, {
    key: 'removeBehaviourObject',
    value: function removeBehaviourObject(obj) {
      var _this2 = this;

      if (_.isFunction(obj.forStageRemove)) {
        obj.forStageRemove().then(function (stageObject) {
          if (_.isArray(stageObject)) {
            _this2.draw.removeChild.apply(_this2.draw, stageObject);
          } else {
            _this2.draw.removeChild(stageObject);
          }
        });
        return;
      }

      var stageObject = obj.forStage();
      if (_.isArray(stageObject)) {
        this.draw.removeChild.apply(this.draw, stageObject);
      } else {
        this.draw.removeChild(stageObject);
      }
    }
  }, {
    key: 'tick',
    value: function tick(time) {
      this.carManager.tick();
      this.parkingManager.tick();
    }
  }, {
    key: 'update',
    value: function update(time) {
      this.ground.update();
      this.selector.update();
      this.issueManager.update();
      this.carManager.update();
      this.behaviourManager.update();
      this.draw.update();
    }
  }, {
    key: 'width',
    get: function get() {
      return document.getElementById('surface').offsetWidth;
    }
  }, {
    key: 'height',
    get: function get() {
      return document.getElementById('surface').offsetHeight;
    }
  }]);

  return Stage;
}(StageBase);

module.exports = new Stage();