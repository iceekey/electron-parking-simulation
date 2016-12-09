let _ = require('lodash');
let jsonfile = require('jsonfile');

let {BrowserWindow} = require('electron');
let {dialog, FileFilter} = require('electron').remote;

window.$ = window.jQuery = require('jquery');
require('./lib/jquery-modal/jquery.modal.min.js');

let {grid} = require('./config');

let showSuccessMessage = (message) => {
  Lobibox.notify('success', {
    size: 'mini',
    delay: false,
    soundPath: 'lib/lobibox/sounds/',
    icon: false,
    rounded: false,
    position: 'bottom right',
    msg: message
  });
};

let showErrorMessage = (message) => {
  Lobibox.notify('error', {
    size: 'mini',
    delay: false,
    soundPath: 'lib/lobibox/sounds/',
    icon: false,
    rounded: false,
    position: 'bottom right',
    msg: message
  });
};

$(document).ready(() => {

  let game = require('./classes/core');
  let stage = require('./classes/stage');

  let $app = $('#app');
  let $surface = $('#surface');
  let $tools = $('#tools');
  let $score = $('#score');
  let $controlButtons = $('#control-buttons');
  let $distr = $('#distribution');
  let $distrOptions = $('#distributionOptions');
  let $clearButton = $('#clear');
  let $importButton = $('#import');
  let $exportButton = $('#export');

  let $launchButton = $('#launch');
  let $regularSpeedButton = $('#regular_speed');
  let $increasedSpeedButton = $('#increased_speed');

  let setGenerator = () => {
    let carManager = stage.carManager;
    switch($distr.val()) {
    case 'determ':
      let value = parseFloat($('#determMean').val());
      carManager.generator.setLinear(value);
      break;
    case 'uniform':
      let min = parseFloat($('#uniformMin').val());
      let max = parseFloat($('#uniformMax').val());
      carManager.generator.setUniform(min, ++max);
      break;
    case 'gauss':
      let mean = parseFloat($('#gaussMean').val());
      let deviation = parseFloat($('#gaussDeviation').val());
      carManager.generator.setGauss(mean, deviation);
      break;
    default:
      let rate = parseFloat($('#expRate').val());
      carManager.generator.setExp(rate);
    }

    carManager.generatorTimeout = null;
  };

  game.init().then(() => {
    game.run(stage);

    $('.numeric').numeric();

    $app.removeClass('hide');
    $tools.hide();
    $clearButton.hide();
    $distrOptions.hide();
    $controlButtons.show();

    $clearButton.click(() => {
      for (let i = 0; i < grid.rows; i++) {
        for (let j = 0; j < grid.columns; j++) {
          stage.ground.grid[j][i] = 0;
        }
      }

      stage.selector.changeStream.next(null);
    });

    $importButton.click(() => {
      dialog.showOpenDialog({
        title: 'Выберите файл для импорта',
        filters: [{
          name: '',
          extensions: ['ump']
        }],
        properties: ['openFile']
      }, files => {
        if (_.isString(files[0])) {
          let path = files[0];
          jsonfile.readFile(path, (err, obj) => {
            if (err) {
              showErrorMessage('Не удалось открыть или прочитать файл');
            }

            if (obj !== null) {
              if (!_.has(obj, 'map') || obj.map.length < grid.rows + 1 || obj.map[0].length < grid.columns) {
                showErrorMessage('Карта не импортируемого файла не совпадает по размерам с текущей');
                obj = null;
              }

              let distrOptions = ['determ', 'uniform', 'gauss', 'exp'];
              if (!_.has(obj, 'options') || !_.has(obj, 'distr') || !distrOptions.includes(obj.distr)) {
                showErrorMessage('Карта содержит некоррекную кофигурацию потока');
                obj = null;
              }

              if (obj !== null) {
                for (let i = 0; i < grid.rows; i++) {
                  for (let j = 0; j < grid.columns; j++) {
                    let value =  parseInt(obj.map[j][i], 10);
                    stage.ground.grid[j][i] = _.isNaN(value) ? 0 : value;
                  }
                }

                stage.selector.changeStream.next(null);

                $distr.val(obj.distr.toString()).trigger('change');

                $('#determMean').val(obj.options.determMean).trigger('change');
                $('#uniformMax').val(obj.options.uniformMax).trigger('change');
                $('#uniformMin').val(obj.options.uniformMin).trigger('change');
                $('#gaussMean').val(obj.options.gaussMean).trigger('change');
                $('#gaussDeviation').val(obj.options.gaussDeviation).trigger('change');
                $('#expRate').val(obj.options.expRate).trigger('change');

                showSuccessMessage('Файл успешно импортирован');
              }
            }

            window.$.modal.close();
          });
        }
      });
    });

    $exportButton.click(() => {
      dialog.showSaveDialog({
        title: 'Выберите файл для экспорта',
        filters: [{
          name: 'Конфигурация парковки',
          extensions: ['ump']
        }]
      }, filename => {

        if (!filename) {
          return;
        }

        let exportJSON = {
          map: stage.ground.grid,
          distr: $distr.val(),
          options: {
            determMean: $('#determMean').val(),
            uniformMax: $('#uniformMax').val(),
            uniformMin: $('#uniformMin').val(),
            gaussMean: $('#gaussMean').val(),
            gaussDeviation: $('#gaussDeviation').val(),
            expRate: $('#expRate').val()
          }
        };

        jsonfile.writeFile(filename, exportJSON, error => {
          if (error) {
            showErrorMessage('Не удалось сохранить файл');
          } else {
            showSuccessMessage('Файл успешно сохранен');;
          }

          window.$.modal.close();
        });
      });
    });

    $surface.mouseenter(function() {
      let $this = $(this);
      let control = $controlButtons.first();
      if (control.offset().top < $this.offset().top + $this.height() - 20) {
        control.addClass('blur');
      }
    }).mouseleave(function() {
      $controlButtons.removeClass('blur');
    });

    $launchButton.click(function() {
      let distrValid = true;
      let distrType = $distr.val();

      $('.' + distrType).each(function() {
        let value = $(this).val();
        if (_.trim(value).length <= 0) {
          distrValid = false;
        }

        value = parseFloat(value);
        if (value < 0) {
          distrValid = false;
        }

        if (distrType === 'exp' && value <= 0) {
          distrValid = false;
        }

        if (distrType === 'exp' && value <= 0) {
          distrValid = false;
        }

        if (distrType === 'uniform') {
          let min = parseFloat($('#uniformMin').val());
          let max = parseFloat($('#uniformMax').val());

          if (min > max) {
            distrValid = false;
          }
        }
      });

      if (!distrValid) {
        showErrorMessage('Неверные параметры закона распределения');
        return;
      }

      if (!stage.issueManager.valid) {
        showErrorMessage('В процессе проверки текущей конфигурации парковки обнаружены ошибки');
        return;
      }

      let $this = $(this);
      if (game.stage.running) {
        $score.hide();
        $tools.show();
        $clearButton.show();
        $distrOptions.show();
        $increasedSpeedButton.hide();
        $regularSpeedButton.hide();

        $this.addClass('green');
        $this.html('Запустить');
        game.stage.stop();
      } else {
        $score.show();
        $tools.hide();
        $clearButton.hide();
        $distrOptions.hide();
        $increasedSpeedButton.show();
        $regularSpeedButton.show().trigger('click');

        $this.removeClass('green');
        $this.html('Редактировать');

        setGenerator();
        game.stage.start();
      }
    });

    $distr.change(function() {
      let $this = $(this);
      let type = $this.val();

      $('.input-group').hide();
      $('.' + type + 'Group').show();
    });

    $regularSpeedButton.show().trigger('click');
    $distr.trigger('change');
    setGenerator();
  });
});

