
var engine = require('engine');

function KeySelection(game) {
	this.game = game;
	this.world = game.world;
	this.settings = {
		stepOffset: 100,
		stepRotation: 1,
		speed: 1
	};

	this.game.input.on('keydown', this._onDown, this);
	this.game.input.on('keyup', this._onUp, this);

};

KeySelection.prototype.constructor = KeySelection;

KeySelection.prototype._onDown = function(event, key) {
	var keyboard = this.game.input.keyboard,
		move = false,
		data = {
			offset: 0,
			rotation: 0
		};

	if(keyboard.isDown(engine.Keyboard.UP)) {
		data.offset = -this.settings.stepOffset * this.settings.speed;
		move = true;
	}
	if(keyboard.isDown(engine.Keyboard.LEFT)) {
		data.offset = -this.settings.stepOffset * this.settings.speed;
		data.rotation = -this.settings.stepRotation;
		move = true;
	}
	if(keyboard.isDown(engine.Keyboard.RIGHT)) {
		data.offset = -this.settings.stepOffset * this.settings.speed;
		data.rotation = this.settings.stepRotation;
		move = true;
	}

	move && this.game.emit('ship/moveTo', data);
};

KeySelection.prototype._onUp = function(event, key) {
	var keyboard = this.game.input.keyboard;
	var data = {
		offset: 0,
		rotation: 0
	};
	if(keyboard.isDown(engine.Keyboard.LEFT) || keyboard.isDown(engine.Keyboard.UP) || keyboard.isDown(engine.Keyboard.RIGHT)){
		this._onDown();
	} else{
		this.game.emit('ship/moveTo', data);
	}

};

module.exports = KeySelection;