var engine = require( 'engine' ),
    Layout = require( '../Layout' ),
    Pane = require( '../components/Pane' ),
    Label = require( '../components/Label' ),
    Image = require( '../components/Image' );

function getRandomInt ( min, max ) {
    return Math.floor( Math.random() * (max - min) ) + min;
}


function LeaderboardPane ( game, settings ) {
    Pane.call( this, game, {
        width : 188,
        height : 250,
        padding : [ 0 ],
        layout : {
            ax : Layout.CENTER,
            ay : Layout.TOP,
            direction : Layout.VERTICAL,
            gap : 200
        },
        bg : {
            fillAlpha : 0.0,
            borderSize : 0.0
        },
        usersPane : {
            padding : [ 0 ],
            layout: {
                type: 'border',
                gap: [5, 0]
            },
            bg : {
                fillAlpha : 0.0,
            }
        },
        currentUserPane : {
            padding : [ 0 ],
            layout: {
                type: 'border',
                gap: [5, 0]
            },
            bg : {
                fillAlpha : 0.0,
            }
        },
        userRowPane : {
            padding : [ 0 ],
            layout: {
                type: 'border',
                gap: [0, 5]
            },
            bg : {
                fillAlpha : 0.0
            }
        },
        userRowLabel : {
            text : {
                fontName : 'medium',
                tint : 0x66aaff
            },
            bg : {
                fillAlpha : 0.0,
                borderAlpha : 0.0
            }
        }

    } );


    var scope = this;
    this.users = [];
    this.sortedUsers = [];
    this.uuid = 0;
    this.max = 10;
    this.rows = [];

    this.currentUser = {name : 'Current user', score : "300", current: true };
    this.users.push( this.currentUser );

    this.infoUsersPane = new Pane( game, this.settings.usersPane );

    this.infoCurrentUserPane = new Pane( game, this.settings.currentUserPane );

    this.currentUserRow = drawRow( true );

    this.addPanel( Layout.TOP, this.infoUsersPane );
    this.addPanel( Layout.BOTTOM, this.infoCurrentUserPane );


    for ( var i = 0; i < this.max; i++ ) {

        drawRow( false );

    }

    this.addUsers();

    function drawRow ( current ) {

        var panel = current ? scope.infoCurrentUserPane : scope.infoUsersPane;
        var row = new Pane( game, scope.settings.userRowPane );

        var size = 85;
        var paddingName = [ 6, 2, 6, size ];
        var paddingScore = [ 6, 15 ];

        scope.settings.userRowLabel.padding = paddingName;
        var userName = new Label( game, 'Name', scope.settings.userRowLabel );

        scope.settings.userRowLabel.padding = paddingScore;
        var userScore = new Label( game, 'score', scope.settings.userRowLabel );


        row.addPanel( Layout.RIGHT, userScore );
        row.addPanel( Layout.LEFT, userName );

        row.userName = userName;
        row.userScore = userScore;


        panel.addPanel( Layout.TOP, row );

        if(!current)
            scope.rows.push( row );

        return row;

    }


    game.clock.events.loop(2000, this._updateInfo, this);
};

LeaderboardPane.prototype = Object.create( Pane.prototype );
LeaderboardPane.prototype.constructor = LeaderboardPane;


LeaderboardPane.prototype.validate = function () {
    return Pane.prototype.validate.call( this );
};

LeaderboardPane.prototype.addUsers = function(){

    for ( var i = 0; i < this.max; i++ ) {

        this.addPlayer( { name : 'Some user' + i+i+i+i, score : getRandomInt( 0, 500 ).toString() } );

    }

};

LeaderboardPane.prototype.addPlayer = function ( user ) {

    user.uuid = this.uuid++;

    this.users.push( user );

    this.users.sort( function ( a, b ) {
        return b.score - a.score;
    } );

    if( this.rows.length > 9)
        this.redraw();
};


LeaderboardPane.prototype.removePlayer = function ( user ) {

    this.users.splice(this.users.indexOf(user), 1);

    this.redraw();

};

LeaderboardPane.prototype.redraw = function (){

    draw( this.currentUserRow, this.currentUser);

    for ( var i = 0; i < this.max; i++ ) {

        if( this.users[i]) {

            draw( this.rows[i], this.users[i])
        } else {

            draw( this.rows[i], undefined);
        }
    }


    function draw( row, user){

        if(user){

            var right = 85 * (4 / (user.name.length == 0 ? 4 : user.name.length));
            var color = user.current ? 0x09FF7A : 0xFFFFFF;

            row.userName.tint = row.userScore.tint = color;
            row.userName.padding.right = right;
            row.userName.text = user.name;
            row.userScore.text = user.score;
            row.visible = true;

        } else {
            row.visible = false;
        }


        row.invalidate( true );
    }

};

LeaderboardPane.prototype.getSortedUsers = function(){

    this.sortedUsers = this.users.concat().splice(0, 10);

    if( this.sortedUsers.indexOf( this.currentUser) == -1){
        this.sortedUsers[ this.max - 1 ] = this.currentUser;
    }

};


LeaderboardPane.prototype._updateInfo = function () {

    for(var i = 0, j = this.users.length; i < j; i++){
        this.users[i ].score = getRandomInt(0, 500 ).toString();
    }

    this.users.sort( function ( a, b ) {
        return b.score - a.score;
    } );

    var index = getRandomInt(0, this.users.length - 1);

    if(this.users[index ].current){
        if(index >= this.users.length)
            index--;
        else
            index++;
    }

    var random = getRandomInt(0, 5);

    if(random < 2 && this.users.length > 2)
        this.removePlayer(this.users[index ]);
    else if(random > 2 && this.users.length <= this.max * 3)
        this.addPlayer({ name : 'User' + this.uuid, score : getRandomInt( 0, 500 ).toString() });

    this.redraw();

};

module.exports = LeaderboardPane;