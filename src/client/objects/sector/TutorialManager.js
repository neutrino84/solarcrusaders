var engine = require('engine');

function TutorialManager(game) {
	this.game = game;
	console.log('in TutorialManager')
	

	this.game.clock.events.add(500, this._firstIteration, this)
};

TutorialManager.prototype._firstIteration = function(){
	// console.log('in first iteration, this.game is ', this.game)
	this.game.emit('ingame/message', 'Welcome to the Mobius Dimension tutorial', 3000)
	this.game.clock.events.add(3500, function(){
		this.game.emit('ingame/message', 'Lets begin', 3000)
	}, this)
	// this.game.emit('ingame/message', 'Welcome to the Mobius Dimension tutorial', 3000)

};

module.exports = TutorialManager;