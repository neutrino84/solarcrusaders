var engine = require('engine' ),
  Layout = require('../Layout'),
  Pane = require('../components/Pane'),
  Label = require('../components/Label'),
  Panel = require('../Panel'),
  Input = require('../components/Input'),
  Button = require('../components/Button');


function ChatSystemPane(game, settings) {
  Pane.call(this, game, {
    padding: [9],
    layout: {
      ax: Layout.RIGHT,
      ay: Layout.TOP,
      direction: Layout.VERTICAL,
      gap: 0
    },
    bg: {
      fillAlpha: 0.0,
      borderSize: 0.0
    },
    chatPane: {
      padding: [0],
      layout: {},
      bg: {
        fillAlpha: 0.0,
      }
    },
    formPane: {
      padding: [1],
      layout: {
        direction: Layout.HORIZONTAL,
        gap: 4
      },
      bg: {
        fillAlpha: 0.6,
        color: 0x000000,
        radius: 0.0,
        borderSize: 0.0,
        blendMode: engine.BlendMode.MULTIPLY
      }
    },
    messageRowPane: {
      padding: [6],
      layout: {
        type: 'border',
        gap: [0, 0]
      },
      bg: {
        fillAlpha: 0.0
      }
    },
    messageRowLabel: {
      padding: [0],
      text: {
        fontName: 'full',
        tint: 0x66aaff
      },
      bg: {
        fillAlpha: 0.0,
        borderAlpha: 0.0
      }
    },
    input: {
      width: 180
    },
    button: {
      padding: [1],
      border: [0],
      bg: {
        radius: 0.0,
        color: 0x336699,
        fillAlpha: 1.0
      },
      label: {
        padding: [4, 5, 3, 5],
        bg: {
          fillAlpha: 0.2,
          color: 0x000000,
          radius: 0.0,
          borderSize: 0.0,
          blendMode: engine.BlendMode.MULTIPLY
        },
        text: {
          fontName: 'full'
        }
      }
    },
    hotKeys:{
      enter: engine.Keyboard.ENTER,
      scrollUp: engine.Keyboard.K,
      scrollDown: engine.Keyboard.M,
      scrollFullUp: engine.Keyboard.J,
      scrollFullDown: engine.Keyboard.L
    }
  });

  this.length = Math.floor(this.settings.input.width / 5);
  this.stack = [];
  this.stackMaxSize = 500;
  this.scrollTop = 0;

  this.chatPane = new Pane(game, this.settings.chatPane);
  this.formPane = new Pane(game, this.settings.formPane);
  this.textInput = new Input(game, 'message', this.settings.input);
  this.enterButton = new Button(game, 'enter', this.settings.button);

  this.initialize();

  this.test(settings.users);

};

ChatSystemPane.prototype = Object.create(Pane.prototype);
ChatSystemPane.prototype.constructor = ChatSystemPane;

ChatSystemPane.prototype.initialize = function() {
  var keyboard = game.input.keyboard;

  this.formPane.addPanel(Layout.NONE, this.textInput);
  this.formPane.addPanel(Layout.NONE, this.enterButton);

  this.addPanel(Layout.STRETCH, this.chatPane);
  this.addPanel(Layout.STRETCH, this.formPane);

  this._setSize();
  this._setRows();

  this.textInput.start();
  this.enterButton.on('inputUp', this._clear, this);

  game.input.on('keypress', function(event, key){
    if(this.textInput._selected){
      this.game.input.keyboard.removeKeyCapture([engine.Keyboard.ENTER]);
    }
    keyboard.isDown(this.settings.hotKeys.enter) && this._clear();

    if(!this.textInput._selected){
      if(keyboard.isDown(this.settings.hotKeys.scrollUp)){
        this._scrollOn(-1);
      }
      if(keyboard.isDown(this.settings.hotKeys.scrollDown)){
        this._scrollOn(1);
      }
      if(keyboard.isDown(this.settings.hotKeys.scrollFullUp)){
        this._scrollOn(0, 0);
      }
      if(keyboard.isDown(this.settings.hotKeys.scrollFullDown)){
        this._scrollOn(0, this.stack.length - this.max);
      }
    }
  }, this);
};

ChatSystemPane.prototype._setSize = function(){
  this.max = Math.max(10, Math.floor(game.height / 2 / 21.8));
};

ChatSystemPane.prototype._setRows = function(){
  var self = this,
    panel = this.chatPane;
  this.rows = [];
  panel.removeAll();

  for(var i=0; i<this.max; i++) {
    drawRow();
  }

  function drawRow(){
    var row = new Pane(game, self.settings.messageRowPane),
      label = new Label(game, ' ', self.settings.messageRowLabel);

    row.addPanel(Layout.LEFT, label);
    row.label = label;
    panel.addPanel(Layout.STRETCH, row);
    self.rows.push(row);
  }
};

ChatSystemPane.prototype._clear = function(e){
  if(this.textInput.value !== ''){
    this._addMessage(game.auth.user.username, this.textInput.value);
    this.textInput.value = '';
  }
  this.textInput.blur();
};

ChatSystemPane.prototype._addMessage = function (name, string){
  var self = this,
      now = new Date(),
      hours = now.getHours() % 12 || 12,
      minutes = now.getMinutes();

  hours = hours.toString().length == 1 ? '0' + hours : hours;
  minutes = minutes.toString().length == 1 ? '0' + minutes : minutes;

  var str = '(' + name + ')  (' + hours + '-' + minutes + ')';
  this.stack.push({string: str, isName: true});

  var record = '',
      tempStringArray = string.split(' ');

  for(var i=0; i<tempStringArray.length; i++){
    if(tempStringArray[i].length >= this.length){
      divideString(tempStringArray[i]);
      if(tempStringArray.length - 1 == i){
        this.stack.push({string: record, isName: false});
      }
      continue;
    }

    if(record.length < this.length && tempStringArray[i].length + record.length + 1 <= this.length){
      record += (record.length == 0 ? '' : ' ') + tempStringArray[i];
      if(tempStringArray.length - 1 == i){
        this.stack.push({string: record, isName: false});
      }
    } else{
      this.stack.push({string: record, isName: false});
      record = '';
      i--;
    }
  }

  if(this.stack.length > this.stackMaxSize){
    this.stack.splice(0, this.stack.length - this.stackMaxSize);
  }
  this.scrollTop = this.stack.length - this.max;
  this._redraw();

  function divideString(str){
    record += (record.length == 0 ? '' : ' ');
    var start = 0,
        length = self.length - record.length;

    while(start < str.length){
      var piece = str.substr(start, length);
      record += piece;
      if(record.length < self.length){
        break;
      }
      self.stack.push({string: record, isName: false});
      record = '';
      start += length;
      length = self.length;
    }

  }
};

ChatSystemPane.prototype._redraw = function (){
  var self = this;

  for(var i=0; i<this.max; i++){
    draw(i);
  }

  function draw(index){
    var row = self.rows[index],
      data = self.stack[self.scrollTop + index];
    if(data){
      row.label.text = data.string;
      row.label.tint = data.isName ? 0x09FF7A : 0xFFFFFF;
    } else{
      row.label.text = ' ';
    }
  }
  this.invalidate(true);
};

ChatSystemPane.prototype._scrollOn = function(step, position){
  if(position !== undefined){
    this.scrollTop = position;
    this._redraw();
    return;
  }
  if((this.scrollTop == this.stack.length - this.max && step > 0) || (this.scrollTop == 0 && step < 0)){
    return;
  }
  this.scrollTop += step;
  this._redraw();
};

ChatSystemPane.prototype.resize = function(width, height) {
  this._setSize();
  this._setRows();
  this.scrollTop = this.stack.length - this.max;
  this._redraw();
};

ChatSystemPane.prototype.test = function(users){
  var testText = [
    'Dolor posuere',
    'Potenti elit lectus augue eget iaculis vitae etiam',
    'Felis ullamcorper curae erat nulla luctus sociosqu phasellus posuere habitasse sollicitudin, ' +
    'libero sit potenti leo ultricies etiam blandit id platea augue, erat habitant fermentum lorem.'
  ];

  for(var i=0; i<this.max; i++){
    var name = users[engine.Math.getRandomInt(0, 10)].name,
      message = testText[engine.Math.getRandomInt(0, 3)];
    this._addMessage(name, message);
  }
};

module.exports = ChatSystemPane;
