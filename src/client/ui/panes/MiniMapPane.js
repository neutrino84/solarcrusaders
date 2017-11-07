var engine = require('engine' ),
	Layout = require('../Layout'),
	Pane = require('../components/Pane'),
	MiniMap = require('../../fx/MiniMap');

function MiniMapPane(game, settings) {
	Pane.call(this, game, {
		miniMap: {
			layout: {
				ax: Layout.RIGHT,
				ay: Layout.BOTTOM
			}
		}
	});

	this.miniMap = new MiniMap(game, this.settings.miniMap);
	this.addView(this.miniMap);

};


MiniMapPane.prototype = Object.create(Pane.prototype);
MiniMapPane.prototype.constructor = MiniMapPane;

MiniMapPane.prototype.resize = function(width, height) {
	this.miniMap.resize(width, height);
};

module.exports = MiniMapPane; 