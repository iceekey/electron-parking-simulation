'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PD = require('probability-distributions');

module.exports = function () {
  function Generator() {
    _classCallCheck(this, Generator);

    this.generator = null;
    this.options = [];
    this.values = [];
  }

  _createClass(Generator, [{
    key: 'setGauss',
    value: function setGauss(mean, deviation) {
      this.generator = PD.rnorm;
      this.options = [mean, deviation];
      this.generate();
    }
  }, {
    key: 'setExp',
    value: function setExp(rate) {
      this.generator = PD.rexp;
      this.options = [rate];
      this.generate();
    }
  }, {
    key: 'setUniform',
    value: function setUniform(min, max) {
      this.generator = PD.runif;
      this.options = [min, max];
      this.generate();
    }
  }, {
    key: 'setLinear',
    value: function setLinear(mean) {
      this.setGauss(mean, 0);
      this.generate();
    }
  }, {
    key: 'generate',
    value: function generate() {
      var _generator;

      this.values = (_generator = this.generator).call.apply(_generator, [PD, 1000].concat(_toConsumableArray(this.options)));
    }
  }, {
    key: 'next',
    value: function next() {
      if (this.values.length <= 0) {
        this.generate();
      }

      var value = this.values[0];
      this.values = this.values.slice(1, this.values.length);
      return Math.abs(value);
    }
  }]);

  return Generator;
}();