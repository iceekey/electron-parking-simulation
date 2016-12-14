'use strict';

var _ = require('lodash');
var jsonfile = require('jsonfile');

var _require = require('electron'),
    BrowserWindow = _require.BrowserWindow;

var _require$remote = require('electron').remote,
    dialog = _require$remote.dialog,
    FileFilter = _require$remote.FileFilter;

window.$ = window.jQuery = require('jquery');
require('./../src/lib/jquery-modal/jquery.modal.min.js');

var _require2 = require('./config'),
    grid = _require2.grid;

var showSuccessMessage = function showSuccessMessage(message) {
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

var showErrorMessage = function showErrorMessage(message) {
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

$(document).ready(function () {

  var game = require('./classes/core');
  var stage = require('./classes/stage');

  var $app = $('#app');
  var $surface = $('#surface');
  var $tools = $('#tools');
  var $score = $('#score');
  var $controlButtons = $('#control-buttons');
  var $distr = $('#distribution');
  var $distrOptions = $('#distributionOptions');
  var $clearButton = $('#clear');
  var $importButton = $('#import');
  var $exportButton = $('#export');

  var $launchButton = $('#launch');
  var $regularSpeedButton = $('#regular_speed');
  var $increasedSpeedButton = $('#increased_speed');

  var setGenerator = function setGenerator() {
    var carManager = stage.carManager;
    switch ($distr.val()) {
      case 'determ':
        var value = parseFloat($('#determMean').val());
        carManager.generator.setLinear(value);
        break;
      case 'uniform':
        var min = parseFloat($('#uniformMin').val());
        var max = parseFloat($('#uniformMax').val());
        carManager.generator.setUniform(min, ++max);
        break;
      case 'gauss':
        var mean = parseFloat($('#gaussMean').val());
        var deviation = parseFloat($('#gaussDeviation').val());
        carManager.generator.setGauss(mean, deviation);
        break;
      default:
        var rate = parseFloat($('#expRate').val());
        carManager.generator.setExp(rate);
    }

    carManager.generatorTimeout = null;
  };

  game.init().then(function () {
    game.run(stage);

    $('.numeric').numeric();

    $app.removeClass('hide');
    $tools.hide();
    $clearButton.hide();
    $distrOptions.hide();
    $controlButtons.show();

    $clearButton.click(function () {
      for (var i = 0; i < grid.rows; i++) {
        for (var j = 0; j < grid.columns; j++) {
          stage.ground.grid[j][i] = 0;
        }
      }

      stage.selector.changeStream.next(null);
    });

    $importButton.click(function () {
      dialog.showOpenDialog({
        title: 'Выберите файл для импорта',
        filters: [{
          name: '',
          extensions: ['ump']
        }],
        properties: ['openFile']
      }, function (files) {
        if (_.isString(files[0])) {
          var path = files[0];
          jsonfile.readFile(path, function (err, obj) {
            if (err) {
              showErrorMessage('Не удалось открыть или прочитать файл');
            }

            if (obj !== null) {
              if (!_.has(obj, 'map') || obj.map.length < grid.rows + 1 || obj.map[0].length < grid.columns) {
                showErrorMessage('Карта импортируемого файла не совпадает по размерам с текущей');
                obj = null;
              }

              var distrOptions = ['determ', 'uniform', 'gauss', 'exp'];
              if (!_.has(obj, 'options') || !_.has(obj, 'distr') || !distrOptions.includes(obj.distr)) {
                showErrorMessage('Карта содержит некоррекную кофигурацию потока');
                obj = null;
              }

              if (obj !== null) {
                for (var i = 0; i < grid.rows; i++) {
                  for (var j = 0; j < grid.columns; j++) {
                    var value = parseInt(obj.map[j][i], 10);
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

    $exportButton.click(function () {
      dialog.showSaveDialog({
        title: 'Выберите файл для экспорта',
        filters: [{
          name: 'Конфигурация парковки',
          extensions: ['ump']
        }]
      }, function (filename) {

        if (!filename) {
          return;
        }

        var exportJSON = {
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

        jsonfile.writeFile(filename, exportJSON, function (error) {
          if (error) {
            showErrorMessage('Не удалось сохранить файл');
          } else {
            showSuccessMessage('Файл успешно сохранен');;
          }

          window.$.modal.close();
        });
      });
    });

    $surface.mouseenter(function () {
      var $this = $(this);
      var control = $controlButtons.first();
      if (control.offset().top < $this.offset().top + $this.height() - 20) {
        control.addClass('blur');
      }
    }).mouseleave(function () {
      $controlButtons.removeClass('blur');
    });

    $launchButton.click(function () {
      var distrValid = true;
      var distrType = $distr.val();

      $('.' + distrType).each(function () {
        var value = $(this).val();
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
          var min = parseFloat($('#uniformMin').val());
          var max = parseFloat($('#uniformMax').val());

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

      var $this = $(this);
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

    $distr.change(function () {
      var $this = $(this);
      var type = $this.val();

      $('.input-group').hide();
      $('.' + type + 'Group').show();
    });

    $regularSpeedButton.show().trigger('click');
    $distr.trigger('change');
    setGenerator();
  });
});