let PD = require('probability-distributions');

module.exports = class Generator {
  constructor() {
    this.generator = null;
    this.options = [];
    this.values =  [];

    this.setGauss(0, 100);
  }

  setGauss(mean, deviation) {
    this.generator = PD.rnorm;
    this.options = [mean, deviation];
    this.values = [];
  }

  setExp(rate) {
    this.generator = PD.rexp;
    this.options = [rate];
    this.values = [];
  }

  setUniform(min, max) {
    this.generator = PD.runif;
    this.options = [min, max];
    this.values = [];
  }

  setLinear(mean) {
    this.setGauss(mean, 0);
  }

  next() {
    if (this.values.length <= 0) {
      this.values = this.generator.call(PD, 20, ...this.options);
    }

    let value = this.values[0];
    this.values = this.values.slice(1, this.values.length);
    return Math.abs(value);
  }
};
