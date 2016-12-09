let _ = require('lodash');
let jsonfile = require('jsonfile');

let {BrowserWindow} = require('electron');
let {dialog, FileFilter} = require('electron').remote;

window.$ = window.jQuery = require('./lib/jquery/dist/jquery.min.js');

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

    $importButton.click(() => {
      dialog.showOpenDialog({
        title: 'Выберите файл для импорта',
        filters: [{
          name: '',
          extensions: ['ump']
        }],
        properties: ['openFile']
      }, files => {
        console.log(files);
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
        let exportJSON = {
          map: stage.ground.grid,
          distr: $distr.val(),
          options: {
            determMean: $('#determMean').val(),
            uniformMax: $('#uniformMax').val(),
            uniformMin: $('#uniformMin').val(),
            gaussMean: $('#gaussMean').val(),
            gaussMean: $('#gaussMean').val(),
            expRate: $('#expRate').val()
          }
        };

        jsonfile.writeFile(filename, exportJSON, error => {
          if (error) {
            Lobibox.notify('error', {
              size: 'mini',
              delay: false,
              soundPath: 'lib/lobibox/sounds/',
              icon: false,
              rounded: false,
              position: 'bottom right',
              msg: 'Не удалось сохранить файл'
            });
          }

          Lobibox.notify('success', {
            size: 'mini',
            delay: false,
            soundPath: 'lib/lobibox/sounds/',
            icon: false,
            rounded: false,
            position: 'bottom right',
            msg: 'Файл успешно сохранен'
          });

          modal.close();
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
        Lobibox.notify('error', {
          size: 'mini',
          delay: false,
          soundPath: 'lib/lobibox/sounds/',
          icon: false,
          rounded: false,
          position: 'bottom right',
          msg: 'Неверные параметры закона распределения'
        });

        return;
      }

      if (!stage.issueManager.valid) {
        Lobibox.notify('error', {
          size: 'mini',
          delay: false,
          soundPath: 'lib/lobibox/sounds/',
          icon: false,
          rounded: false,
          position: 'bottom right',
          msg: 'В процессе проверки текущей конфигурации парковки обнаружены ошибки'
        });

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

