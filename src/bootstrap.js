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

  let $launchButton = $('#launch');
  let $regularSpeedButton = $('#regular_speed');
  let $increasedSpeedButton = $('#increased_speed');

  $tools.hide();
  $distr.trigger('change');

  game.init().then(() => {
    game.run(stage);
    $app.removeClass('hide');
    $controlButtons.show();
    $regularSpeedButton.show().trigger('click');

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
      if (!stage.issueManager.valid) {
        Lobibox.notify('error', {
          size: 'mini',
          delay: false,
          soundPath: 'lib/lobibox/sounds/',
          icon: false,
          rounded: false,
          position: 'bottom right',
          msg: 'В процессе проверки текущей конфигурации парковки обнаружены ошибки.'
        });

        return;
      }

      let $this = $(this);
      if (game.stage.running) {
        $score.hide();
        $tools.show();
        $increasedSpeedButton.hide();
        $regularSpeedButton.hide();

        $this.addClass('green');
        $this.html('Запустить');
        game.stage.stop();
      } else {
        $score.show();
        $tools.hide();
        $increasedSpeedButton.show();
        $regularSpeedButton.show().trigger('click');

        $this.removeClass('green');
        $this.html('Редактировать');
        game.stage.start();
      }
    });

    $distr.change(function() {
      let $this = $(this);
      $('.options input').hide();
      $
    });
  });
});

