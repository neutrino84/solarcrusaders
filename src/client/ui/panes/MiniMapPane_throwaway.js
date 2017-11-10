var engine = require('engine' ),
	Layout = require('../Layout'),
	Pane = require('../components/Pane'),
	CircleView = require('../views/CircleView'),
	MiniMap = require('../../fx/MiniMap');

function MiniMapPane(game) {
	Pane.call(this, game, {
		constraint: Layout.TOP,
		padding: [40, 0, 0, 0],
		// width: 200,
		height: 1,
		layout: {
			type: 'flow',
			ax: Layout.LEFT,
			ay: Layout.TOP
		},
		bg: {
		  fillAlpha: 0.0,
		  color: 0x000000
		}
	});

	// this.addPanel(
	// 	Pane.call(this, game, {
	// 		constraint: Layout.RIGHT,
	// 		padding: [40, 0, 0, 0],
	// 		width: 50,
	// 		height: 50,
	// 		layout: {
	// 			type: 'flow',
	// 			ax: Layout.RIGHT,
	// 			ay: Layout.TOP
	// 		},
	// 		bg: {
	// 		  fillAlpha: 0.0,
	// 		  color: 0xff0000
	// 		}
	// 	})
	// );

	this.miniMap = new MiniMap(game);

	

	// this.circle = new CircleView(game, null);

	this.addView(this.miniMap);
	// this.addPanel(this.miniMap.shipGroup);

};


MiniMapPane.prototype = Object.create(Pane.prototype);
MiniMapPane.prototype.constructor = MiniMapPane;

// MiniMapPane.prototype.resize = function(width, height) {
// 	this.miniMap.resize(width, height);
// };

module.exports = MiniMapPane; 