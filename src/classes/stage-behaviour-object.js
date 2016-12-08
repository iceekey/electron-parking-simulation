module.exports = class StageBehaviourObject {
  constructor(stage) {
    this.stage = stage;
  }

  update() {
    throw new Error('No implementation for \'update()\'');
  }

  forStage() {
    throw new Error('No implementation for \'forStage()\'');
  }
};