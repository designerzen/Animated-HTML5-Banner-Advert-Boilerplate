/////////////////////////////////////////////////////////////////
//
// Simple Carousel :
// Requires TweenMax or TweenLite
// Simply specify the options to configure
//
/////////////////////////////////////////////////////////////////
var Carousel = (function(){
	
	'use strict';
    
	var EVENT_CLICK = 'click';
	
	var CLASS_DISABLED = 'disabled',
		CLASS_SELECTED = 'selected';
		
	var SAFETY_MARGIN = 500;
	
	var ALPHA_HIDDEN = 0.0,
		ALPHA_MINIMUM = 0.4,
		ALPHA_MAXIMUM = 1;
	
	var SCALE_MINIMUM = 0.9,
		SCALE_MAXIMUM = 1;
   
		
	var DURATION_ANIM_IN = 0.5,
		DURATION_ANIM_OUT = 0.5;
   
	var 
        interval,
        startTime,
        maxDuration = -1,
        
		index = 0,
		quantity = 0,
        items = [],
        positions = [],
        selectors = [],
        
		revealed = false,
		paused = false,
        stopped = true,
		
        period = 0 ,
        leftOffset = 0,
        quantity = 0;
		
		
    // Registered DOM elements
    var 
		children,
        leftButton, 
        rightButton, 
        pageSelector, 
        container;
		
		
	// Default Setup Options...
	var defaults = {
        simultaneous 	: -1,		// how many items to move at once
        visibleItems 	: 1,		// how many items to show on screen at once
        remainders 		: false,	// mainly for the selector, do we always revert to equal spacing
        
		wrap 			: true,		// make it so that the next / previous buttons are never disabled
		piles 			: true,		// rather than a whole line of items, just 3 stacks
		endless			: true,		// ensure that there are never any blank spaces
		
		debug			: false,
		callback		: null,
		callbackArgs	: undefined
	};
	
    /////////////////////////////////////////////////////////////////
	// Reposition an element using CSS and Transform 3D
    /////////////////////////////////////////////////////////////////   
	var move = function( element, position, zIndex, maximise, duration, hide )
	{
		// move all below i to the right position...
		var scale = maximise ? SCALE_MAXIMUM : SCALE_MINIMUM;
		var endPoint = { 
			//ease:Back.easeOut.config(1.04),
			ease:Cubic.easeInOut,
			css:{
				//opacity:ALPHA_MINIMUM,
				//scale:scale,
				//z:0,
				//transformPerspective:300,
				zIndex:zIndex,
				x:position.x, 
				y:position.y
			}
		};
		var alpha = maximise ? ALPHA_MAXIMUM : !hide ? ALPHA_MINIMUM : ALPHA_HIDDEN;
		
		// override before reveal!
		if (!revealed) alpha = ALPHA_HIDDEN;
		
		// console.error( element.id , endPoint.css );
		
		TweenLite.to( element, duration, endPoint );
		TweenLite.to( element, duration - 0.1, { css:{ scale:scale}, ease:Cubic.easeOut } );
		TweenLite.to( element, duration * 0.5, { css:{ opacity: alpha}, ease:Cubic.easeOut } );		// Fade in!
	};

    /////////////////////////////////////////////////////////////////
	// Construct
    /////////////////////////////////////////////////////////////////
	function Carousel() {}

	/////////////////////////////////////////////////////////////////
	// Use an Option Object to configure this carousel
	// Sets the buttons to move the carousel
    /////////////////////////////////////////////////////////////////
    Carousel.prototype.setup = function ( element, options, entries, startFromIndex )
    {
		// make the parent element as many times wide as one element...
        // multiplied by the times on screen
		var accumulatedWidth = 0;
        var self = this;
         
		children = entries ? entries : element.childNodes;
        
		// If a starting index has been set
		index = startFromIndex || index;
		
		// Create the configuration
		defaults = extend( {}, defaults, options );		// overwrite extend
		
        container = element;
        quantity = children.length;
     
        var childWidth;
        for (var c=0; c<quantity;++c)
        {
            var child = children[c];
			// ensure not a comment!
            if ( child.nodeType == 1 )
            {
                childWidth = outerWidth(child);
                // add the previous ones together
                accumulatedWidth += childWidth;
				
                // staticaly set the width now
                child.style.width = childWidth + 'px';
                
				// console.error( c, child, childWidth, accumulatedWidth );
                // save a reference
                items.push( child );
            }
        }
		
		// how many slides are there in total?
        quantity = items.length;
        
        // ensure simultaneous is NEVER ZERO!
		// how many slides are displayed on screen simultaneously?
        if (defaults.simultaneous < 1) 
		{
			var rounded = Math.ceil( outerWidth(element) / childWidth );
			defaults.simultaneous = rounded < 1 ? 1 : rounded;
		}
		
        leftOffset = getOffset( items[0] ).x;
    
		// as pile mode prevents simultaneous amount, override it!
        // now loop through simultaneous to ensure that there are piles...
		if ( defaults.piles )
		{
			defaults.visibleItems = defaults.simultaneous;
			defaults.simultaneous = 1;
			this.stack( items, 0 );
		}else{
			
			// NB. be sure to wrap it in a overflow hidden wrapper!
			// now set the parent width based on the accululated widths of the elements
			element.style.width = (SAFETY_MARGIN+accumulatedWidth) + 'px';
		}
        
		// BIND EVENTS ================================================================
        // now also make sure that the product prevents movement when mouseovered
        bindEvent(element, 'mouseover', function() {
            paused = true;
            clearInterval(interval);
            //interval = setTimeout( self.onAutomaticUpdate, period, self );
        });
        
        bindEvent(element, 'mouseout', function() {
            paused = false;
            clearInterval(interval);
            if (!stopped) interval = setTimeout( self.onAutomaticUpdate, period, self );
        });
		
        if ( defaults.debug ) console.error( 'Carousel Options : ' , defaults );
		
        // move first into view
		// FIXME:
        //this.goto(0);
    };
	
	/////////////////////////////////////////////////////////////////
    // ENABLE / DISABLE the Next and Last Buttons 
    /////////////////////////////////////////////////////////////////
    Carousel.prototype.updateButtons = function ( i )
    {
	// if we are not wrapping
        if ( !defaults.wrap )
        {
			// first
            if ( i === 0 ) 
            {
                UTIL.addClass( leftButton, CLASS_DISABLED );
            }else{
                UTIL.removeClass( leftButton, CLASS_DISABLED );
            }            
            
			// last
            if ( i === quantity-1 ) 
            {
                UTIL.addClass( rightButton, CLASS_DISABLED )
            }else{
                UTIL.removeClass( rightButton, CLASS_DISABLED );
            }
        }
	};
	
    /////////////////////////////////////////////////////////////////
    // Send the Carousel to a specific target frame
    /////////////////////////////////////////////////////////////////
    Carousel.prototype.goto = function ( i )
    {
		// We are already here!
        if ( index === i ) return;
		
		revealed = true;
		
		// We have a *new* index and an old index...
		var active = items[ index ];
		UTIL.removeClass( active, CLASS_SELECTED );
		
		if ( !defaults.piles )
		{
			// LINEAR
			// If we want to move the window into position 
			this.translateX( i );
		}else{
			// STACKS
			// If we want to have little stacks to revolve around
			this.restack( i );
		}
		
		// UI Updates
        this.updateSelectors( i );			// update selectors!
        this.updateButtons( i );			// update buttons
		
		// cache previous index
		index = i;
       
		// CALLBACK
		if ( defaults.callback && typeof( defaults.callback ) === "function" )
		{
			var child = items[ i ];
			var self = defaults.callbackScope || this;
			defaults.callback.apply( self, [ child, defaults.callbackArgs ] );
		}
    };
	
	
	/////////////////////////////////////////////////////////////////
	// Move Carousel into position...
	/////////////////////////////////////////////////////////////////
	Carousel.prototype.translateX = function( i )
	{
		var child = items[ i ];
		var position = leftOffset-getOffset( child ).x;

		// translate the cards
        TweenLite.to( container, 1, {x:position, ease:Back.easeOut.config(1.02) } );
	};
	
	// STACKS ======================================================================================

    /////////////////////////////////////////////////////////////////
    // POSITION : depending on options
	// Move each slide into position...
    /////////////////////////////////////////////////////////////////
	Carousel.prototype.stack = function ( elements, startIndex )
    {
		// increment so as to skip empty space on the left
		if ( startIndex < 1 ) startIndex = 1;
		
		var e, l, s, child, position, endPoint = { 
			css:{
				position:'absolute',
				//transformOrigin:"center center",
				//perspective:300,
				//opacity:ALPHA_MINIMUM ,
				opacity:ALPHA_HIDDEN ,
				transformPerspective:300,
				//transformStyle:"preserve-3d"
			} 
		};
		
		// Fetch POSITIONS
		// Now re-arrange the items in the way they should be...simultaneous
		for ( s=0; s < 3; ++s )
		{
			child = elements[s];	
			position = getOffset( child );
			// Store this position in memory for use in restacking
			positions[ s ] = position;
			// now it is important to overwrite the positions set in the css with auto
			child.style.left = 'auto';
			child.style.top = 'auto';
			
			//console.error(s +'. fetch : ' , position );
		}
		
		// BEFORE
		// Now re-arrange the items in the way they should be...
		position = positions[0];
		endPoint.css.x = position.x; 
		endPoint.css.y = position.y; 
		for ( e=0; e < startIndex; ++e )
		{
			child = elements[e];	
			//console.error('position 0 < ' , position );
			TweenLite.set( child, endPoint );
		}
		
		// DURING
		position = positions[1];
		endPoint.css.x = position.x; 
		endPoint.css.y = position.y; 
		child = elements[startIndex];	
		TweenLite.set( child, endPoint );
		//console.error('position 1 - ' , position );
		
		// AFTER
		// Now re-arrange the items in the way they should be...
		position = positions[2];
		endPoint.css.x = position.x; 
		endPoint.css.y = position.y; 
		for ( e=startIndex, l=elements.length; e < l; ++e )
		{
			child = elements[e];	
			//console.error('position 2 > ' , position );
			TweenLite.set( child, endPoint );
		}
	};
	
    //////////////////////////////////////////////////////////////////////////////////////////////////////
	// Move each slide into position...
	// based around the index i that is the central focus and has the class 'selected'
	//////////////////////////////////////////////////////////////////////////////////////////////////////
	Carousel.prototype.restack = function( i )
	{
		var c,
			child,
			zIndex,
			
			leftPosition = positions[ 0 ],
			centralPosition = positions[ 1 ],
			rightPosition = positions[ 2 ];
		
		// determine direction of movement...
		var movingLeft = i < index;
		var crossing = index - i;
		var doesCross = crossing !== -1 && crossing != 1;
		if (doesCross) movingLeft = !movingLeft; 
		
		// So ignoring the middle selection
		var visibleBefore = (defaults.visibleItems - 1) // 2;
	
		//console.error( movingLeft ? 'Left' : 'Right', doesCross ? ' crossing' : ' not-crossed');
		
				
		// We ideally want to move the item in a bezier curve motion
		// {bezier:{type:"soft", values:[{x:100, y:250}, {x:300, y:0}, {x:500, y:400}], autoRotate:true}
		
		// Try to pass through these following values - no control points necessary!
		// {bezier:{curviness:1.25, values:[{x:100, y:250}, {x:300, y:0}, {x:500, y:400}], autoRotate:true}

		// This works in two different directions.
		// Left, where the main item moves to the left, all previous items are moved to the right position
		
		// Right, where the main item moves to the right, all subsequent items are moved to the left position
		
		var zIndex = 0;
		var offset = 2;
		var range = index - offset;

		for ( c=0; c < quantity; ++c )
		{
			// Per Child
			child = items[ c ];
			
			if ( c === i ) 
			{
				// SELECTION ===================================================================
				
				// Move the selected item into the central VIEW position and TOP MOST z index
				move( child, centralPosition, quantity, true, DURATION_ANIM_IN, false );
				UTIL.addClass( child, CLASS_SELECTED );
				
			}else if ( c === index ){
				
				// PREVIOUS SELECTION ==========================================================
	
				// Move EXISTING previously active one current out of the way at top-1 z-index
				zIndex = quantity - 1;
				switch ( movingLeft )
				{
					// LEFT :
					case true:
						// OLD selection - move to the LEFT spot
						move( child, leftPosition, zIndex, false, DURATION_ANIM_OUT, false );
						break;
						
					// RIGHT :
					default:
						// OLD selection - move to the RIGHT spot
						move( child, rightPosition, zIndex, false, DURATION_ANIM_OUT, false );
						break;
				}
				
			}else if (c < i){
			
				// BEFORE ======================================================================
				
				zIndex = quantity - (i - c);
				switch ( movingLeft )
				{
					// LEFT --------------------------------------------------------------------
					case true:

						// One BEFORE
						if ( c === i - 1 ) 
						{
							// TAKE FRINGES LEFT and move to the RIGHT spot doesCross
							move( child, rightPosition, zIndex, false, DURATION_ANIM_OUT, false );
						}else  {
							// BEFORE selection - move to the hidden
							move( child, centralPosition, zIndex, false, DURATION_ANIM_OUT, true );
						}
						break;
					
					// RIGHT -------------------------------------------------------------------
					default :
						
						if (( i === quantity-1 )&&( c === 0 ))
						{
							// Straddling so let's move it on fast
							move( child, leftPosition, zIndex, false, DURATION_ANIM_OUT, false );
						}else{
							// HIDE
							move( child, centralPosition, zIndex, false, DURATION_ANIM_OUT, true );
						}
				}
	
			}else{
			
			//AFTER  ==========================================================================
				
				zIndex = quantity - (c - i) - 1;
				switch ( movingLeft )
				{
					// LEFT -------------------------------------------------------------------
					case true:
						if (( i === 0 )&&( c >= quantity-1 ))
						{
							// Straddling so let's move it on fast
							move( child, rightPosition, zIndex, false, DURATION_ANIM_OUT, false );
						}else{
							// HIDE
							move( child, centralPosition, zIndex, false, DURATION_ANIM_OUT, true );
						}
						break;
						
						
					// RIGHT ------------------------------------------------------------------	
					default :
						if (( c === i+1 ))
						{
							move( child, leftPosition, zIndex, false, DURATION_ANIM_OUT, false );
						}else{
							// HIDE
							move( child, centralPosition, zIndex, false, DURATION_ANIM_OUT, true );
						}
				}
				
			}
			// console.log( i, index, quantity, movingLeft, crossing, doesCross );
			
			// END FOR LOOP
		}
		
		
		
		/*
		// ----------------------------------------------------------------
		// BEFORE Loop
		// 0 -> Index - 1
		for ( c; c < i; ++c )
		{
			// should always be LESS than i
			child = items[ c ];
			
			zIndex 		= c == i-1 ? quantity - (i - c) : 0;
			alpha 		= c == i-1 ? ALPHA_MINIMUM : ALPHA_HIDDEN;
			alpha 		= ALPHA_MINIMUM;
			position 	= !defaults.endless && c != i-1 ? rightPosition : leftPosition;
			
			if ( defaults.endless && c != i-1 )
			{
				// HIDE!
				position = centralPosition ;
				TweenLite.set( child, { css:{ opacity:alpha } } );
			
			}else{
				
				// Position at LEFT
				position = leftPosition;
				TweenLite.to( child, 0.2, { css:{ opacity:alpha } } );
			}
			
			//position 	= leftPosition;
			//
			endPoint = { 
				//ease:Back.easeOut.config(1.04),
				ease:Cubic.easeInOut,
				css:{
					//opacity:ALPHA_MINIMUM,
					scale:SCALE_MINIMUM,
					//z:0,
					zIndex:zIndex,
					x:position.x, 
					y:position.y
				}
			};
			TweenLite.to( child, DURATION_ANIM_OUT, endPoint );
			//console.log(c + '. Before ',position);
		}
		
		
		// ----------------------------------------------------------------
		// SELECTED 
		// matrix3d(a, b, 0, 0, c, d, 0, 0, 0, 0, 1, 0, tx, ty, 0, 1).
		// during Loop
		// Index
		child = items[ i ];
		endPoint = { 
			//ease:Back.easeOut.config(1.0001),
			ease:Cubic.easeInOut,
			css:{
				//opacity:1,
				//z:0,//'140px',
				scale:SCALE_MAXIMUM,
				zIndex:quantity,
				x:centralPosition.x, 
				y:centralPosition.y
			} 
		};
		
		// Compound...
		TweenLite.to( child, DURATION_ANIM_IN, endPoint );
		TweenLite.to( child, 0.2, { css:{ opacity:ALPHA_MAXIMUM } } );
		UTIL.addClass( child, CLASS_SELECTED );
		// ----------------------------------------------------------------
		
		
		
		// AFTER Loop
		// Index -> End
		c = i + 1;
		
		// Immediately After
		for ( c; c < quantity; ++c )
		{
			child = items[ c ];
			zIndex 		= c == i-1 ? quantity - c : 0;
			alpha 		= c == i+1 ? ALPHA_MINIMUM : ALPHA_HIDDEN;
			alpha 		= ALPHA_MINIMUM;
			//position 	= c == i+1 ? leftPosition : rightPosition;
			//position 	= rightPosition;
			
			if ( defaults.endless && c != i+1 )
			{
				// HIDE!
				position = centralPosition ;
				TweenLite.set( child, { css:{ opacity:alpha } } );
				
			}else{
				position = rightPosition;
				TweenLite.to( child, 0.2, { css:{ opacity:alpha } } );
			}
			
			
			endPoint = { 
				//ease:Back.easeOut.config(1.04),
				ease:Cubic.easeInOut,
				css:{
					//opacity:ALPHA_MINIMUM,
					//z:0,
					scale:SCALE_MINIMUM,
					zIndex:zIndex,
					x:rightPosition.x, 
					y:rightPosition.y
				} 
			};
			TweenLite.to( child, DURATION_ANIM_OUT, endPoint );
			//console.log(c+'. After ',position);
		}
		
		
		// This rotates the items so that they always look in a circle
		// Based around 2 settings
		if ( defaults.endless )
		{
			var crossing = index - i;
			var doesCross = crossing !== -1 && crossing != 1;
			var isEnd = i === 0 || i === quantity;
			var isNearEnd = i === 1 || i === quantity - 1;
			var isTowardsEnd = i === 2 || i === quantity - 2;
			
			console.log( i, index, quantity, movingLeft, crossing, doesCross );
			
			// both of these need to be TRUE
			if ( isEnd )
			{
				console.log( 'isEnd '+isEnd+' movingLeft '+movingLeft+ ' crossing:'+crossing );
			}else if ( isNearEnd ){
				console.log( 'isNearEnd '+isNearEnd+' movingLeft '+movingLeft+ ' crossing:'+crossing );
				// let's move the next one into position
				//console.error( 'Now moving into gap! doesCross ' + doesCross );
				// find out which pile is shortest...
				
				
			}else if ( isTowardsEnd ){
				console.log( 'isTowardsEnd '+isTowardsEnd+' movingLeft '+movingLeft + ' crossing:'+crossing );
			}else{
				//console.log( 'Now moving isNearEnd '+isNearEnd+' movingUp '+movingUp+ ' crossing:'+crossing );
			}
			
			//
			if ( movingLeft )
			{
				console.log( 'Move UP' );
				// take FIRST item and move to last position...
				position = positions[ 0 ];
				child = items[ quantity-1 ];
				
			}else{
				console.log( 'Move DOWN' );
				// take LAST item and move to first position...
				position = positions[ 2 ];
				child = items[ 0 ];
				
			}
			
			endPoint = { 
				//ease:Back.easeOut.config(1.0001),
				ease:Cubic.easeInOut,
				css:{
					//opacity:1,
					//z:0,//'140px',
					scale:SCALE_MINIMUM,
					zIndex:quantity-1,
					x:position.x, 
					y:position.y
				} 
			};
			TweenLite.to( child, DURATION_ANIM_IN, endPoint );
			TweenLite.to( child, 0.2, { css:{ opacity:ALPHA_MINIMUM } } );
		
			//console.log( 'movingUp '+movingUp );
			
			if ( isNearEnd )
			{

				if ( movingLeft )
				{
					console.log( 'Move UP' );
					// take FIRST item and move to last position...
					position = positions[ 2 ];
					child = items[ 0 ];
					
				}else{
					console.log( 'Move DOWN' );
					// take LAST item and move to first position...
					position = positions[ 0 ];
					child = items[ quantity-1 ];
					
					
				}
				endPoint = { 
					//ease:Back.easeOut.config(1.0001),
					ease:Cubic.easeInOut,
					css:{
						//opacity:1,
						//z:0,//'140px',
						scale:SCALE_MINIMUM,
						zIndex:0,
						x:position.x, 
						y:position.y
					} 
				};
				TweenLite.to( child, DURATION_ANIM_IN, endPoint );
				TweenLite.to( child, 0.2, { css:{ opacity:0.5 } } );
			}
			
		}
		*/
		//console.log( i + '. During ',position, ' ***');
		
		if ( defaults.debug ) console.error( items );
	};
    
	// NAVIGATION ======================================================================================

    /////////////////////////////////////////////////////////////////
    // Return to the Previous Item in the Carousel
    /////////////////////////////////////////////////////////////////
    Carousel.prototype.previous = function ( element )
    {
        var i;
        if ( defaults.remainders )
        {
            i = index - defaults.simultaneous < 0 ? quantity + (index - defaults.simultaneous): index - defaults.simultaneous;
        }else if ( defaults.wrap ){
            i = index - defaults.simultaneous < 0 ? quantity-1: index - defaults.simultaneous;
        }else{
            i = index - defaults.simultaneous < 0 ? 0: index - defaults.simultaneous;
        }
        this.goto( i );
    };
    
    /////////////////////////////////////////////////////////////////
    // Advance to the Next Item in the Carousel
    /////////////////////////////////////////////////////////////////
    Carousel.prototype.next = function ( element )
    {
        var i;
        if ( defaults.remainders )
        {
            i = index + defaults.simultaneous >= quantity ? quantity % defaults.simultaneous : index + defaults.simultaneous;
        }else if ( defaults.wrap ){
            i = index + defaults.simultaneous >= quantity ? 0 : index + defaults.simultaneous;
        }else{
            i = index + defaults.simultaneous >= quantity ? quantity-1 : index + defaults.simultaneous;
        }
        this.goto( i );
    };
    
	// AUTOMATE ======================================================================================
	
    /////////////////////////////////////////////////////////////////
    // START Automation - no interaction required to move things
	// seconds is after how much time we advance to next item
	// limit is after how many seconds we STOP
	// eg. ( 3,50 ) means every 3 seconds for 50 seconds
    /////////////////////////////////////////////////////////////////
    Carousel.prototype.automate = function ( seconds, limit )
    {
        // start automatically and run for limit seconds?
        startTime = new Date().getTime(); 
        maxDuration = limit > 0 ? limit * 1000 : -1;
        period = seconds * 1000;
		stopped = false;
        interval = setTimeout( this.onAutomaticUpdate, period, this );
        //console.log('Automation begins at '+startTime+' for '+seconds+' seconds');
    };
	
	/////////////////////////////////////////////////////////////////
    // Animate in this shit
    /////////////////////////////////////////////////////////////////
    Carousel.prototype.reveal = function()
	{
		var tween = new TimelineLite();
		revealed = true;
		for ( var c=0; c < quantity; ++c )
		{
			// Per Child
			var child = items[ c ];
			
			if ( c === index ) tween.fromTo( child, 0.5, {opacity:ALPHA_HIDDEN}, {opacity:ALPHA_MAXIMUM}, '-=0.25' );
			else if ( c === index-1 ) tween.fromTo( child, 0.5, {opacity:ALPHA_HIDDEN}, {opacity:ALPHA_MINIMUM}, '-=0.25' );
			else if ( c === index+1 ) tween.fromTo( child, 0.5, {opacity:ALPHA_HIDDEN}, {opacity:ALPHA_MINIMUM}, '-=0.25' );
			else tween.to( child, 0.5, {opacity:ALPHA_HIDDEN}, '-=0.25' );
		}
		
		return tween;	
	};
    
    /////////////////////////////////////////////////////////////////
    // STOP Automation
    /////////////////////////////////////////////////////////////////
    Carousel.prototype.killAutomation = function()
    {
        if (stopped) return;		// nothing to stop
       
		clearInterval(interval);
        stopped = true;				// now prevent future interactions
        //console.log('Automation ends after '+elapsed+' seconds');
    };
    
    /////////////////////////////////////////////////////////////////
    // EVENT : If there is no interaction with the buttons,
    // then automatically interact with the carousel
    /////////////////////////////////////////////////////////////////
    Carousel.prototype.onAutomaticUpdate = function( scope, seconds )
    {
		if ( maxDuration > 0 )
		{
			var elapsed = new Date().getTime() - startTime; 
			//console.log(elapsed + '/'+maxDuration +' Automate '+!paused);
			if (elapsed > maxDuration)
			{
				stopped = true; 
			}
		}
		
        if (!paused&&!stopped) scope.next();
        if (stopped)
        {
            //console.log('Automation completed at '+startTime+' for '+elapsed + '/'+maxDuration+' seconds');
        }else{
            interval = setTimeout( scope.onAutomaticUpdate, period, scope );   
        }
    };
	
	// PUBLIC =========================================================
    
    /////////////////////////////////////////////////////////////////
    // ASSIGN : 
    // Bind the Click event on an element to trigger PREVIOUS
    /////////////////////////////////////////////////////////////////
    Carousel.prototype.assignLeftButton = function ( element, killAutomation )
    {
        var self = this;
        leftButton = element;
        bindEvent(leftButton, EVENT_CLICK, function() {
            if (killAutomation) self.killAutomation();
            self.previous();
        });
    };
    
    /////////////////////////////////////////////////////////////////
    // ASSIGN : 
    // Bind the Click event on an element to trigger NEXT
    /////////////////////////////////////////////////////////////////
    Carousel.prototype.assignRightButton = function ( element, killAutomation )
    {
        var self = this;
        rightButton = element;
        bindEvent(rightButton, EVENT_CLICK, function() {
             if (killAutomation) self.killAutomation();
            self.next();
        });
    };
	
	/////////////////////////////////////////////////////////////////
    // ASSIGN : 
    // Bind the Breadcrumb Navigator to move pages
    /////////////////////////////////////////////////////////////////
    Carousel.prototype.assignSelector = function ( element, killAutomation, centraliseX )
    {
        var self = this;
        // now we know how many simulataneously we can show...
        var f = Math.ceil( quantity / defaults.simultaneous );
        var children = element.childNodes;
        
        var firstChild;
        // get first none text node...
        for (var c=0, l=children.length; c<l; ++c)
        {
            var child = children[c];
            if ( child.nodeType == 1 )
            {
                firstChild = child;
                break;
            }
        }
        
        if (!firstChild)
        {
            console.error('Genesis Node unable to clone');
            return;
        }
        
        for (var i=0; i<f; ++i)
        {
            var selector =  firstChild.cloneNode(true);
            if (!selector)
            {
                console.error('Genesis Node unable to clone');
                break;   
            }
            
            selector.setAttribute("id", "page-" + i);
            console.log( i, selector, firstChild );
           
            if ( i === 0) selector.setAttribute("class", CLASS_SELECTED + " selector");
            else selector.setAttribute("class", "selector");
            
            // set up button actions
            bindEvent(selector, EVENT_CLICK, function(event) {
                var id = parseInt( this.id.split('-')[1] ) * defaults.simultaneous;
                self.goto( id );
                if (killAutomation) self.killAutomation();
            });
            
            // Save reference
            selectors.push( selector);
            
            // Inject!
            element.appendChild( selector ); 
        }
       
        if (centraliseX)
        {
            // Centralise the selector?
            // ensure that this centres in it's parent...
            var parentWidth = getWidth( element.parentNode );
            var selectorWidth = outerWidth( element );
            var leftOffset = ( parentWidth - selectorWidth ) * 0.5;
            element.style.left = leftOffset + 'px';
            //console.error( element.parentNode + ' Parent Width '+parentWidth+' Selector Width '+selectorWidth+ ' left offset ' + leftOffset );
        }
    
        // Now remove our orignal node
        firstChild.parentNode.removeChild(firstChild);
    };
    
    /////////////////////////////////////////////////////////////////
    // Update the Breadcrumb Selectors with the correct index
    /////////////////////////////////////////////////////////////////
    Carousel.prototype.updateSelectors = function ( i )
    {
        var lookOutFor = parseInt( i / defaults.simultaneous );
        // loop through alll selectors
        for ( var q=0, l=selectors.length; q < l; ++q)
        {
            var selector = selectors[q];
            if ( q === lookOutFor )
            {
                // Match!
                //console.log('Selector Matched!');
                UTIL.addClass( selector, CLASS_SELECTED );
            }else{
                // Unmatched
                //console.log('Selector missed ', lookOutFor);
                UTIL.removeClass( selector, CLASS_SELECTED );
            }
        }  
    };
    
	return Carousel;
   
})();