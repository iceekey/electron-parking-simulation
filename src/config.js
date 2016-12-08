module.exports.carColors = ['black', 'blue', 'green', 'grey', 'orange', 'white', 'red', 'yellow'];

module.exports.assets = [
   {id: 'GROUND', src: './images/ground/spritesheet.png'},
   {id: 'CARS_BLACK', src: './images/cars/black_vehicles.png'},
   {id: 'CARS_BLUE', src: './images/cars/blue_vehicles.png'},
   {id: 'CARS_GREEN', src: './images/cars/green_vehicles.png'},
   {id: 'CARS_GREY', src: './images/cars/grey_vehicles.png'},
   {id: 'CARS_ORANGE', src: './images/cars/orange_vehicles.png'},
   {id: 'CARS_WHITE', src: './images/cars/white_vehicles.png'},
   {id: 'CARS_RED', src: './images/cars/red_vehicles.png'},
   {id: 'CARS_YELLOW', src: './images/cars/yellow_vehicles.png'},
   {id: 'PARKING_SIGN', src: './images/parking-sign.png'},
   {id: 'SELECTOR', src: './images/selector.png'}
];

module.exports.coreConfig = {
  FPS: 24,
  TICK_ENCOUNTER: 10
};

module.exports.grid = {
  rows: 10,
  columns: 10
};

module.exports.defaultGrid = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, -1, 0, -1, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0, -1, 0],
  [0, 1, 1, 0, 1, -1, 1, 1, 1, 0],
  [0, -1, 0, 0, 1, 1, 1, 0, 1, 0],
  [0, 0, 0, 0, 1, 0, -1, 0, 1, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
  [0, -1, 0, 1, 1, 1, 1, 1, 1, 0],
  [-1, 1, 1, 1, -1, 0, 0, 0, 1, 0],
  [0, -1, 0, 1, 0, 0, 0, 0, 1, 0]
];


module.exports.carRect = {
  width: 32,
  height: 32
};

module.exports.groundRect = {
  width: 110,
  height: 75,
  xShift: 2,
  yShift: -12
};

module.exports.parkingSignRect = {
  width: 20,
  height: 30
};