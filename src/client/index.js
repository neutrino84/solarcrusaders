// run the polyfills
require('./polyfill');

var engine = require('engine'),
    Auth = require('./net/Auth'),
    LoadingState = require('./states/LoadingState'),

    startGameEngine = function() {
      console.log('loading state is ', LoadingState)
      var game = new engine.Game({
            parent: 'content',
            antialias: false,
            width: 1024,
            height: 576
          }),
          loadingState = new LoadingState(game);

      // activate net code
      game.auth = new Auth(game);

      // create game state
      game.states.add('loader', loadingState, true, true);
    };

engine.Device.whenReady(function() {
  var el = global.document.getElementById('content'),
      dialog = global.document.getElementById('dialog'),
      message, device = engine.Device;
  if(device.desktop && device.webGL && (
      device.firefox || device.chrome || device.safari)) {
    el.className = 'running';
    startGameEngine();
  } else {
    el.className = 'error';
    if(device.desktop) {
      if(device.webGL) {
        message = 'your browser is not yet supported';
      } else {
        message = 'you need a compatible browser and graphics card to run this demo.';
      }
    } else {
      message = 'mobile devices are not yet supported'
    }
    dialog.innerHTML = message;
  }
});
