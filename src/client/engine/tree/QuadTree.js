/* copyright: Raidho Coaxil 2015 <rcoaxil@gmail.com> */
 
/* A word of caution: tree grows exponentially deeper as two objects
 * closing on each other. Having two objects very close will create
 * tree of extremely large depths, and having them in identical
 * positions will cause infinite growth and eventual crash.
 * With "realistic" physics (if objects have finite sizes and can not
 * overlap) it shouldn't be possible to happen. Setting skewing threshold
 * will make quads with smaller dimensions than the setting dynamically
 * change its center so that every object remains in its own quadrant
 * and therefore no further space partitioning is necessary. Setting this
 * value too high creates sub-optimal (long and narrow) quad meshes.
 */
 
/* It's necessary to call "clear" on the quadtree to free the memory,
 * as quads keep references to one another thus creating memory island.
 */
 
QuadTree = function ( x, y, left, top, right, bottom, skew, parent, childid )
{
        //this._pool = null;
       
        this.skew = skew || 0;
        this.skewed = false;
       
        this.x = x || 0;
        this.y = y || 0;
       
        this.left   = left   || this.x;
        this.right  = right  || this.x;
        this.top    = top    || this.y;
        this.bottom = bottom || this.y;
       
        this._quad_parent = parent || null;
        this._quad_childid = childid || 0;
       
        if ( !this.children ) this.children = [ ];
        if ( !this.bounds ) this.bounds = [{},{},{},{}];
       
        for ( var i = 0; i < 4; i++ )
        {
                this.children[i] = null;
                this.bounds[i].left   = i == 0 || i == 2 ? this.left : this.x;
                this.bounds[i].right  = i == 0 || i == 2 ? this.x    : this.right;
                this.bounds[i].top    = i == 0 || i == 1 ? this.top  : this.y;
                this.bounds[i].bottom = i == 0 || i == 1 ? this.y    : this.bottom;
        }
}
 
QuadTree.prototype =
{
        // object inserted into quadtree will receive this function
        // try to update the quadtree at minimum expense
        _updateQuadPosition: function ( )
        {
                if ( !this._quad_parent )
                        return;
                var pos = this.position, quad = this._quad_parent;
                // still within bounds (inclusive), probably just moving across quadrants
                if ( pos.x >= quad.left && pos.y >= quad.top && pos.x <= quad.right && pos.y <= quad.bottom )
                {
                        // calculate new child position
                        var c = ( pos.x > quad.x ? 1 : 0 ) + ( pos.y > quad.y ? 2 : 0 );
                        // nothing has changed
                        if ( c == this._quad_childid )
                                return;
                        // moving to a different quadrant - clear current quadrant record
                        quad.children[ this._quad_childid ] = null;
                        // that quadrant happens to be empty - just shift object to new location
                        if ( quad.children[ c ] == null )
                        {
                                quad.children[ c ] = this;
                                this._quad_childid = c;
                        }
                        // non-empty - extra action has to be taken
                        else
                        {
                                // insertion does skewing in already, but doing this explicitly saves some calculations
                                if ( !quad.trySkewIn ( this ) )
                                        quad.insert ( this );
                        }
                }
                else
                // went out of bounds
                {
                        quad.children[ this._quad_childid ] = null;
                        quad.insert ( this );
                        quad.simplify ( );
                }
        },
        // insert object into quadtree; returns success state
        insert: function ( obj )
        {
                var x = obj.x || obj.position.x, y = obj.y || obj.position.y;
                // if insertion requested out of quad's bounds (inclusive), try inserting into parent instead
                if ( x < this.left || x > this.right || y < this.top || y > this.bottom )
                {
                        if ( this._quad_parent )
                                return this._quad_parent.insert ( obj );
                        // if insertion is out of top level bounds, it will fail
                        else return false;
                }
                // past this point, insertion can't fail (hence always return true)
                // calculate quadrant
                var child = ( x > this.x ? 1 : 0 ) + ( y > this.y ? 2 : 0 );
                // this leaf is intermediate node - go deeper
                if ( this.children[ child ] instanceof QuadTree )
                {
                        this.children[ child ].insert ( obj );
                        return true;
                }
               
                // found an empty leaf - put the object on it
                else if ( this.children[ child ] == null )
                {
                        this.children[ child ] = obj;
                        // an object inserted into quadtree receives a couple of system variables and a "updateQuadPosition" function
                        obj._quad_parent = this;
                        obj._quad_childid = child;
                        if ( !(obj instanceof QuadTree) )
                                obj.updateQuadPosition = QuadTree.prototype._updateQuadPosition;
                        return true;
                }
               
                // leaf is already occupied by an object (not a quad) - create intermediate node and go deeper
                else if ( !this.trySkewIn ( obj ) )
                {
                        // save current object
                        var cur = this.children[ child ];
                       
                        // create new quad node
                        if ( this.skewed ||
                                 this.bounds[ child ].bottom - this.bounds[ child ].top < this.skew ||
                                 this.bounds[ child ].right - this.bounds[ child ].left < this.skew )
                                var sx = ( cur.position.x + x ) / 2,
                                        sy = ( cur.position.y + y ) / 2,
                                        skew = true;
                        else
                                var sx = ( this.bounds[ child ].left + this.bounds[ child ].right  ) / 2,
                                        sy = ( this.bounds[ child ].top  + this.bounds[ child ].bottom ) / 2,
                                        skew = false;  
                        // actually reuse a quad from pool
                        this.children[ child ] = this._pool.reuse ( );
                        QuadTree.call ( this.children[ child ], sx, sy,
                                                        this.bounds[ child ].left,  this.bounds[ child ].top,
                                                        this.bounds[ child ].right, this.bounds[ child ].bottom,
                                                        this.skew, this, child );
                        if ( skew ) this.children[ child ].skewed = true;
                       
                        // put current object into new quad
                        this.children[ child ].insert ( cur );
                        // put new object into new quad
                        this.children[ child ].insert ( obj );
                        return true;
                }
        },
        // remove the object from the tree
        remove: function ( obj )
        {
                if ( obj._quad_parent == null )
                        return;
                // remove this object from parent's children list
                obj._quad_parent.children[ obj._quad_childid ] = null;
                obj._quad_parent.simplify ( );
                obj._quad_parent = null;
        },
        // try to reduce tree depth to improve search speed
        simplify: function ( nobubble )
        {
                // root node can not be optimized out
                if ( this._quad_parent == null )
                        return;
               
                var child = null;
                for ( var i = 0; i < 4; i++ )
                {
                        // node has quad children - keep the node
                        if ( this.children[ i ] instanceof QuadTree ) return;
                        // find ordinary children
                        if ( this.children[ i ] != null )
                        {
                                // more than 1 child - keep the node
                                if ( child ) return;
                                // save the child
                                child = this.children[ i ];
                        }
                }
                // it has exactly 1 child and its not a quad - set the child as parent's child
                if ( child )
                {
                        this._quad_parent.children[ this._quad_childid ] = child;
                        child._quad_parent  = this._quad_parent;
                        child._quad_childid = this._quad_childid;
                }
                // it has no children - remove reference from its parent
                else
                        this._quad_parent.children[ this._quad_childid ] = null;
                // discard quad back to pool and propagate optimization upwards
                this.discard ( );
                if ( !nobubble ) this._quad_parent.simplify ( );
                // remove parent reference (memory leak concern)
                this._quad_parent = null;
        },
        // do a full tree optimization
        optimize: function ( )
        {
                // optimize every child first
                for ( var i = 0; i < 4; i++ )
                        if ( this.children[ i ] instanceof QuadTree )
                                this.children[ i ].optimize ( );
                // then, optimize itself
                this.simplify ( true );
        },
       
        // attempt to skew the quad to avoid partition and tree growth
        // that will automatically insert the object (if provided); it is assumed it's within quad bounds
        trySkewIn: function ( obj )
        {
                if ( !this.skewed || obj instanceof QuadTree )
                        return false;
               
                // why not array? because that generates garbage
                var child1 = obj || null, child2 = null, child3 = null;
                for ( var i = 0; i < 4; i++ )
                {
                        // skewed quad has quad children - skewing failed
                        if ( this.children[ i ] instanceof QuadTree )
                                return false;
                       
                        if ( this.children[ i ] != obj && this.children[ i ] != null )
                        {
                                // 4th child found (3rd already set) - skewing failed
                                if ( child3 ) return false;
                                else if ( child2 ) child3 = this.children[ i ];
                                else if ( child1 ) child2 = this.children[ i ];
                                else               child1 = this.children[ i ];
                        }
                }
               
                // only one child - no reason to skew (that should never happen to begin with, auto-simplify and all)
                //if ( !child2 ) return this.simplify ( );
               
                //all 3 points can not share identical X or Y coordinate
                if ( child3 && ( ( child1.position.x == child2.position.x && child1.position.x == child3.position.x ) ||
                                                 ( child1.position.y == child2.position.y && child1.position.y == child3.position.y ) ) )
                        return false;
               
                // find new skewed position (centroid of children positions)
                if ( child3 )
                        var x = ( child1.position.x + child2.position.x + child3.position.x ) / 3,
                                y = ( child1.position.y + child2.position.y + child3.position.y ) / 3;
                else
                        var x = ( child1.position.x + child2.position.x ) / 2,
                                y = ( child1.position.y + child2.position.y ) / 2;
                // find children's quadrants
                var c1 = ( child1.position.x > x ? 1 : 0 ) + ( child1.position.y > y ? 2 : 0 );
                var c2 = ( child2.position.x > x ? 1 : 0 ) + ( child2.position.y > y ? 2 : 0 );
                // check for conflicts (there can only be conflicts if there's 3 children)
                if ( child3 )
                {
                        /* Unless all 3 points share identical X or Y coordinate, there exists a point
                         * with vertical and horizontal lines through it that separates all 3 points into
                         * distinct quadrants.
                         *
                         * I don't have solid mathematical proof for that, but idea is rather simple:
                         * Points may be evenly separated into their own quadrants just by drawing a
                         * line through their centroid. Separating 3 points by line(s) will make at most
                         * 2 of them share the same space. If that's the case, then, since centroid
                         * is located between all points, two conflicting points are on the opposite
                         * quadrant of aligned point, and adjacent quadrants are vacant. Drawing a line
                         * between two conflicting points will split them in different quadrants:
                         * horizontal line will put one of points in vertically adjacent vacant quadrant
                         * and vertical line will put it in horizontally adjacent quadrant. Either
                         * way only affects one vacant quadrant and does not disturb the aligned point.
                         */
                        var c3 = ( child3.position.x > x ? 1 : 0 ) + ( child3.position.y > y ? 2 : 0 );
                        var conf = false;
                        if ( c1 == c2 ) { if ( Math.abs ( child1.position.x - child2.position.x ) > Math.abs ( child1.position.y - child2.position.y ) )
                                x = ( child1.position.x + child2.position.x ) / 2; else y = ( child1.position.y + child2.position.y ) / 2; conf = true; }
                        else if ( c2 == c3 ) { if ( Math.abs ( child2.position.x - child3.position.x ) > Math.abs ( child2.position.y - child3.position.y ) )
                                x = ( child2.position.x + child3.position.x ) / 2; else y = ( child2.position.y + child3.position.y ) / 2; conf = true; }
                        else if ( c1 == c3 ) { if ( Math.abs ( child1.position.x - child3.position.x ) > Math.abs ( child1.position.y - child3.position.y ) )
                                x = ( child1.position.x + child3.position.x ) / 2; else y = ( child1.position.y + child3.position.y ) / 2; conf = true; }
                        // a conflict was resolved - compute new children positions
                        if ( conf )
                        {
                                c1 = ( child1.position.x > x ? 1 : 0 ) + ( child1.position.y > y ? 2 : 0 );
                                c2 = ( child2.position.x > x ? 1 : 0 ) + ( child2.position.y > y ? 2 : 0 );
                                c3 = ( child3.position.x > x ? 1 : 0 ) + ( child3.position.y > y ? 2 : 0 );
                                /*
                                if ( c1 == c2 || c2 == c3 || c1 == c3 ) // conflict still wasn't resolved
                                {
                                        console.log ( "I've screwed up my maths..."); // never actually happened
                                        return false;
                                }
                                */
                        }
                }
                // skew the quad
                this.x = x; this.y = y;
                this.bounds[ 0 ].right = x; this.bounds[ 0 ].bottom = y;
                this.bounds[ 1 ].left  = x; this.bounds[ 1 ].bottom = y;
                this.bounds[ 2 ].right = x; this.bounds[ 2 ].top    = y;
                this.bounds[ 3 ].left  = x; this.bounds[ 3 ].top    = y;
                // resolve reference records
                                                this.children[ child1._quad_childid ] = null;
                                                this.children[ child2._quad_childid ] = null;
                if ( child3 )   this.children[ child3._quad_childid ] = null;
                                                this.children[ c1 ] = child1;
                                                this.children[ c2 ] = child2;
                if ( child3 )   this.children[ c3 ] = child3;
                                                child1._quad_childid = c1;
                                                child2._quad_childid = c2;
                if ( child3 )   child3._quad_childid = c3;
                // that might have been freshly inserted stray object
                if ( obj )
                {
                        obj._quad_parent = this;
                        obj.updateQuadPosition = QuadTree.prototype._updateQuadPosition;
                }
                return true;
        },
       
        // find every object in given area and put them into reference array
        search: function ( left, top, right, bottom, ref, ignore )
        {
                ref = ref || [];
                // quad lies completely within search bounds (inclusive)
                if ( !ignore ) if ( left <= this.left && right >= this.right && top <= this.top && bottom >= this.bottom )
                        ignore = true;
 
                // quad is partially overlapped by search bounds
                for ( var i = 0; i < 4; i++ )
                {
                        // if quadrant lies completely out of search bounds (inclusive), ignore it
                        if ( !ignore ) if ( left > this.bounds[ i ].right  || right  < this.bounds[ i ].left ||
                                                                top  > this.bounds[ i ].bottom || bottom < this.bounds[ i ].top )
                                continue;
 
                        if ( this.children[ i ] instanceof QuadTree )
                                this.children[ i ].search ( left, top, right, bottom, ref, ignore );
                        else if ( this.children[ i ] != null )
                                ref.push ( this.children[ i ] );
                }
                return ref;
        },
        // clears all references to avoid memory leaks
        clear: function ( )
        {
                for ( var i = 0; i < 4; i++ )
                {
                        // first descend to the bottom
                        if ( this.children[ i ] instanceof QuadTree )
                                this.children[ i ].clear ( );
                        // clear children's parent (this) references
                        if ( this.children[ i ] != null )
                                this.children[ i ]._quad_parent = null;
                        // clear children reference
                        this.children[ i ] = null;
                }
                this.discard ( );
        }
}