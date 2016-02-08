// run the polyfills
require('./polyfill');

var pixi = require('pixi'),
    engine = require('engine'),
    LoadingState = require('./states/LoadingState'),
    Auth = require('./net/Auth'),
    ShipNetManager = require('./net/ShipNetManager'),
    startGameEngine = function() {
      var game = new engine.Game({
            parent: 'content',
            antialias: false,
            width: 1024,
            height: 576
            // forceFXAA: true
          }),
          loadingState = new LoadingState();

      // activate net code
      game.auth = new Auth(game);
      game.shipNetManager = new ShipNetManager(game);

      // create game state
      game.state.add('loader', loadingState, true, true);

      global.game = game;
    };

// setTimeout(function() {
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
        message = 'mobile devices are not supported, but you can still watch!'
      }
      dialog.innerHTML = message;
    }
  });
// }, 50);
