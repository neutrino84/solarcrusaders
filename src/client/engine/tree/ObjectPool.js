
PASTEBIN  |  #1 paste tool since 2002
create new pastetoolsapiarchivefaq
PASTEBIN	 
search...
Search...
 create new paste      trending pastes
sign uploginmy alertsmy settingsmy profile
Want more features on Pastebin? Sign Up, it's FREE!
Public Pastes
Untitled
12 sec ago
Roblox
Robots | 26 sec ago
Untitled
34 sec ago
lastversion
38 sec ago
Untitled
42 sec ago
Untitled
C++ | 42 sec ago
asd33r4fs3f3s
Visual Pro Log | 46 sec ago
некит лох
C++ | 47 sec ago
0
0
Guest
objectpool.js
BY: A GUEST ON SEP 20TH, 2015  |  SYNTAX: JAVASCRIPT  |  SIZE: 0.86 KB  |  VIEWS: 10  |  EXPIRES: NEVER
DOWNLOAD  |  RAW  |  EMBED  |  REPORT ABUSE  |  PRINT  |  QR CODE  |  CLONE
AD-BLOCK DETECTED - PLEASE SUPPORT PASTEBIN BY BUYING A PRO ACCOUNT
For only $2.95 you can unlock loads of extra features, and support Pastebin's development at the same time.
pastebin.com/pro
    
/* copyright: Raidho Coaxil 2015 <rcoaxil@gmail.com> */
 
// object prototype argument required (to automatically create more instances)
ObjectPool = function ( obj )
{
        this.object = obj;
        this.pool = [];
}
 
ObjectPool.prototype =
{
        // pooled object will receive a "discard" function, it puts the object back to pool
        _discard: function ( )
        {
                this._pool.pool.push ( this );
        },
       
        create: function ( )
        {
                var o = new this.object ( );
                o.discard = ObjectPool.prototype._discard;
                o._pool = this;
                return o;
        },
       
        allocate: function ( num )
        {
                for ( var i = 0; i < num; i++ )
                        this.pool.push ( this.create ( ) );
        },
 
        reuse: function ( )
        {
                if ( this.pool.length < 1 )
                        this.allocate ( 4 );
                return this.pool.pop ( );
        },
 
        clear: function ( )
        {
                while ( this.pool.length > 0 )
                        this.pool.pop ( )._pool = null;
        }
}
clone this paste RAW Paste Data

/* copyright: Raidho Coaxil 2015 <rcoaxil@gmail.com> */

// object prototype argument required (to automatically create more instances)
ObjectPool = function ( obj )
{
	this.object = obj;
	this.pool = [];
}

ObjectPool.prototype = 
{
	// pooled object will receive a "discard" function, it puts the object back to pool
	_discard: function ( )
	{
		this._pool.pool.push ( this );
	},
	
	create: function ( )
	{
		var o = new this.object ( );
		o.discard = ObjectPool.prototype._discard;
		o._pool = this;
		return o;
	},
	
	allocate: function ( num )
	{
		for ( var i = 0; i < num; i++ )
			this.pool.push ( this.create ( ) );
	},

	reuse: function ( )
	{
		if ( this.pool.length < 1 )
			this.allocate ( 4 );
		return this.pool.pop ( );
	},

	clear: function ( )
	{
		while ( this.pool.length > 0 )
			this.pool.pop ( )._pool = null;
	}
}
Pastebin.com Tools & Applications
iPhone/iPad  Windows  Firefox  Chrome  WebOS  Android  Mac  Opera  Click.to  UNIX  WinPhone
create new paste  |  api  |  trends  |  syntax languages  |  faq  |  tools  |  privacy  |  cookies  |  contact  |  dmca  |  advertise on pastebin  |  scraping  |  go PRO 
Follow us: pastebin on facebook  |  pastebin on twitter  |  pastebin in the news 
Dedicated Server Hosting by Steadfast
Pastebin v3.11 rendered in: 0.021 seconds 
Site design & logo © 2015 Pastebin; user contributions (pastes) licensed under cc by-sa 3.0  
/* copyright: Raidho Coaxil 2015 <rcoaxil@gmail.com> */

// object prototype argument required (to automatically create more instances)
ObjectPool = function ( obj )
{
	this.object = obj;
	this.pool = [];
}

ObjectPool.prototype = 
{
	// pooled object will receive a "discard" function, it puts the object back to pool
	_discard: function ( )
	{
		this._pool.pool.push ( this );
	},
	
	create: function ( )
	{
		var o = new this.object ( );
		o.discard = ObjectPool.prototype._discard;
		o._pool = this;
		return o;
	},
	
	allocate: function ( num )
	{
		for ( var i = 0; i < num; i++ )
			this.pool.push ( this.create ( ) );
	},

	reuse: function ( )
	{
		if ( this.pool.length < 1 )
			this.allocate ( 4 );
		return this.pool.pop ( );
	},

	clear: function ( )
	{
		while ( this.pool.length > 0 )
			this.pool.pop ( )._pool = null;
	}
}