module.exports = class StageBase {
  constructor() {}

  init() {
    throw new Error('No implementation for \'init()\'');
  }

  update() {
    throw new Error('No implementation for \'update()\'');
  }

  tick() {
    throw new Error('No implementation for \'tick()\'');
  }
};

