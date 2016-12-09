let PD = require('probability-distributions');

module.exports = class Generator {
  constructor() {
    this.generator = null;
    this.options = [];
    this.values =  [];
  }

  setGauss(mean, deviation) {
    this.generator = PD.rnorm;
    this.options = [mean, deviation];
    this.generate();
  }

  setExp(rate) {
    this.generator = PD.rexp;
    this.options = [rate];
    this.generate();
  }

  setUniform(min, max) {
    this.generator = PD.runif;
    this.options = [min, max];
    this.generate();
  }

  setLinear(mean) {
    this.setGauss(mean, 0);
    this.generate();
  }

  generate() {
    this.values = this.generator.call(PD, 1000, ...this.options);
  }

  next() {
    if (this.values.length <= 0) {
      this.generate();
    }

    let value = this.values[0];
    this.values = this.values.slice(1, this.values.length);
    return Math.abs(value);
  }
};
