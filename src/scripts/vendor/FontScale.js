"use strict";

// Polyfills ===============================================================================

// Internet Explorer 8 Poly Fill
if (!window.getComputedStyle) 
{
	window.getComputedStyle = function(el, pseudo) {
		this.el = el;
		this.getPropertyValue = function(prop) {
			var re = /(\-([a-z]){1})/g;
			if (prop === 'float') prop = 'styleFloat';
			if (re.test(prop)) {
				prop = prop.replace(re, function () {
					return arguments[2].toUpperCase();
				});
			}
			return el.currentStyle[prop] ? el.currentStyle[prop] : null;
		}
		return this;
	}
}


///////////////////////////////////////////////////////////////////////////////////////////
//
// Font Recaling Class.
//
//	Instantiate the Class with new FontScale then bind the methds to existing DOM text
// 	There are a variety of different methods to style your fields according to the specs
//
//	The main 
//
///////////////////////////////////////////////////////////////////////////////////////////
var FontScale = (function(){
	
	// Private Shared Methods =============================================================
	
	// absolute maximum times we try to reduce the size...
	var COUNTER_LIMIT = 100;
	var MINIMUM_INCREMENT = 0.05;
	var INITIAL_INCREMENT = 10;
	
	// Extends the options
	var extend = function (a, b){
		var key;
		for(key in b)
			if(b.hasOwnProperty(key))
				a[key] = b[key];
		return a;
	};
	
	// Set minimum and maximum font size thresholds aong with other settings
	var settings = {
		catchment 		: 20,
		tolerance		: 2,
		maxFont 		: 180,
		minFont 		: 6,
		wholeNumbers	: false
	};
	
	// Return a number only version of a composite string
	var onlyNumbers = function(string){
		return parseFloat( string.match(/[0-9]+/g, '')[0]);	
	};
	
	// Return element style
	var getStyle = function (el,style) {
		var cs;
		if (typeof el.currentStyle != 'undefined'){
			cs = el.currentStyle;
		} else {
			cs = document.defaultView.getComputedStyle(el,null);
		}
		return  cs[style];
	};
	
	// Determine if a measurement already features units,
	// and if not, append and return the whole thing
	var addSuffix = function( measure , measurements ){
		measure = measure + "";			// for indexOf to work we must cast as a string
		var hasSuffix = measure.indexOf(measurements) > -1;
		if (hasSuffix) return measure;
		else return measure + measurements;
	};
	
	// Get the Width of an element
	var getWidth = function (element ){
		if (element.clientWidth) return element.clientWidth;
		if (element.offsetWidth) return element.offsetWidth;
		return element.getBoundingClientRect().width;
	};
	
	// Get the Height of an element
	var getHeight = function (element ){
		if (element.clientHeight) return element.clientHeight;
		if (element.offsetHeight) return element.offsetHeight;
		return element.getBoundingClientRect().height;
	};

	// Set the Width of an element
	var setWidth = function (element, width ){
		if (!width) width = getWidth(element);		// if width is undefined, try and fetch it!
		width = addSuffix( width, 'px' );			// add px to width and height if not available
		element.style.width = width;				// overwrite existing width
		return onlyNumbers(width);
	};
	
	// Set the Height of an element
	var setHeight = function (element, height ){
		if (!height) height = getHeight(element);	// if height is undefined, try and fetch it!
		height = addSuffix( height, 'px' );			// add px to width and height if not available
		element.style.height = height;				// overwrite existing height
		return onlyNumbers(height);
	};

	// Get the size of a font as numerals
	var getFontSize = function( element )
	{
		var size = getStyle(element, 'fontSize');
		return onlyNumbers( size );	
	};
	
	
	// Public ===================================================================
	
	// Construct (with extendable options....)
	function FontScale( options )
    {
		extend( settings, options );
    }
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	// This sets (overwrites) the element's own dimensions before injecting the text into the fields
	// Then it increases or decreases the size of the child textfield in percentages until the height is
	// less than the maximum and the width is filled.
	//
	//////////////////////////////////////////////////////////////////////////////////////////////////////
    FontScale.prototype.fixedSize = function( element, width, height, centraliseX, centraliseY )
    {
		// if we have a width specified in the arguments, we should set this width directly onto the element
		height = setHeight( element, height );
		width = setWidth( element, width );
		
		// before we do anything, let's figure out some logistics,
		var savedParameters = {
			display:		getStyle(element, 'display' ),
			size:			getFontSize( element ),
           	width:			width,
			height:			height,
			text:			element.innerHTML,
			centredX:		centraliseX || false,
			centredY:		centraliseY || false
		};
		
		// let us add a <span> tag around the internals of the element
		// this will be useful in scaling things up later on
		element.innerHTML	    	= '<span>'+savedParameters.text+'</span>'
		
		// get span element
		var 
			spanElement				= element.getElementsByTagName('span')[0],			// fetch child span element
			spanElementWidth 		= getWidth( spanElement ),							// span element width
			spanElementHeight 		= getHeight( spanElement ),							// span element width

			spaceX 					= savedParameters.width - spanElementWidth,			// how much left over horizontal space is there?
			spaceY 					= savedParameters.height - spanElementHeight,		// how much left over vertical space is there?
			increment				= 1,												// how much should we modify the size
			exit					= false,											// premature exit
			
			counter				 	= 0;
		
		// the child element is LARGER than the parent!
		if ( (spaceX < 0) || (spaceY < 0) ) 
		{
			increment = -1;
		}
		
		// first set element to be hidden...
		spanElement.style.visibility = 'hidden';
		  
        // now loop through and scale the font
		// (( spaceX > settings.tolerance )||( spaceX < 0 ))&&(
        while ( ( spaceY > settings.tolerance )||( spaceY < 0 ) )
        {
			var 
				currentFontSize 	= getFontSize( spanElement ),
				newSize             = currentFontSize + increment,
				percentage			= 100 * newSize / settings.baseFont;
            
			// make sure we don't extend beyond our settings
			if (newSize > settings.maxFont)
			{
				newSize = settings.maxFont;
				exit = true;
			}else if (newSize < settings.minFont){ 
				newSize = settings.minFont;
				exit = true;
			}
			 
			// User wants integers 
			if ( settings.wholeNumbers )
			{
				newSize = parseInt( newSize );
			}
			
			// original size is 14px
			spanElement.style.fontSize 	= newSize + 'px';
			  
			// update dimensions
            spanElementWidth 	   		= getWidth( spanElement );
			spanElementHeight 			= getHeight( spanElement );
			
			// work out new space remaining
			var newSpaceY 				= savedParameters.height - spanElementHeight;
			
			// check height is not exceeded first
			if ( (increment > 0) && ( spaceY > 0 ) && ( newSpaceY < 0 ) )
			{
				console.error('Text grew so large that space became negative > spanElementWidth:'+spanElementWidth);
				
				// now we must ensure that we exit immediately!
				exit = true;
				
			}else if ( (increment < 0) && ( spaceY > 0 ) && ( newSpaceY < 0 ) ) {
			
			
			}else{
				
				// Still space left?
				spaceX 				    	= savedParameters.width - spanElementWidth;
				spaceY 				    	= newSpaceY;
			}
			
			console.log( increment+' . Space Y : ' + spaceY );
			
			// early exit if match found or issues are encountered
			if ( exit || (counter++ > COUNTER_LIMIT ) ) break;   
        }
		
		// Now try and centralise the contents of the element... 
		// Firstly ensure that the element is at block level
		if ( savedParameters.centredX || savedParameters.centredY )
		{
			spanElement.style.display = 'block';
		}
		
		// Now centralise if there is space left over
		// Horizontally
		if ( savedParameters.centredX )
		{
			spanElement.style.textAlign = 'center';
			//spanElement.style.marginLeft = spaceX * 0.5 + 'px';
			spanElement.style.marginLeft = 'auto';
			spanElement.style.marginRight = 'auto';
		}
		
		// Vertically
		if ( savedParameters.centredY )
		{
			spanElement.style.marginTop = spaceY * 0.5 + 'px';
		}
		
		spanElement.style.visibility = 'inherit';		// and make element visible once again
        
		return spaceY;
	};
	
	
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////
	// 
	// If width is not set, read in width from element and set them absolutely
	// If width is set, resize the element to this size...
	// 
	//////////////////////////////////////////////////////////////////////////////////////////////////////
    FontScale.prototype.fixedWidth = function( element, width, centralise, nowrap )
    {
		// if we have a width specified in the arguments, we should set this width directly onto the element
		width = setWidth( element, width );
		
		// before we do anything, let's figure out some logistics,
		var savedParameters = {
			size:			getFontSize( element ),
           	width:			width,
			text:			element.innerHTML,
			centred:		centralise || false
		};
		
		// let us add a <span> tag around the internals of the element
		// this will be useful in scaling things up later on
		element.innerHTML	    = '<span>'+savedParameters.text+'</span>'
		var spanElement			= element.getElementsByTagName('span')[0];			// fetch child span element
		
		// ensure that our single line does not wrap onto the next line
		if ( nowrap === false ) 
		{
			// multi-line wrapping
			spanElement.style.whiteSpace = 'inherit';
		}else{
			// normal|nowrap|pre|pre-line|pre-wrap|initial|inherit
			spanElement.style.whiteSpace = 'nowrap';
		}
		
		// Get initial set up
		var 
			spanElementWidth 	= getWidth( spanElement ),							// span element width
			space 				= savedParameters.width - spanElementWidth,			// how much left over space is there?
			exit				= false,
			increment			= space < 0 ? -INITIAL_INCREMENT  : INITIAL_INCREMENT,
			counter				= 0,
			newSpace;
		
		
		// first set element to be hidden...
		spanElement.style.visibility = 'hidden';
		
        // now loop through and scale the font
        while (( space > settings.tolerance )||( space < 0 ))
        {
			var 
				currentFontSize 	= getFontSize( spanElement ),
				newFontSize         = currentFontSize + increment;
  
			// User wants integers 
			if ( settings.wholeNumbers )
			{
				newSize = parseInt( newFontSize );
			}
			
			// ensure that the new sizes do not exceed our settings...
			// make sure we don't extend beyond our settings
			if (newFontSize > settings.maxFont)
			{
				newFontSize = settings.maxFont;
				exit = true;
				console.error(counter+'. EXIT > Due to Max size being reached' );
			}else if (newFontSize < settings.minFont){ 
				newFontSize = settings.minFont;
				exit = true;
				console.error(counter+'. EXIT > Due to Min size being reached' );
			}
			
			// now resize to host our new sizes
			spanElement.style.fontSize = newFontSize + 'px';
			//spanElement.style.fontSize = percentage + '%';
			
			var newWidth = getWidth( spanElement );
			var flipped = false;
			var inZone = false;
		
			console.log( counter+'. maxWidth : '+savedParameters.width+'px newWidth : '+newWidth + 'px increment : '+increment );
            
			// check to see if by incrementing we have crossed the extents available
			if (newWidth > spanElementWidth)
			{
				// GROWN
				if (increment < 0) 
				{
					console.error('Growing from Shrinking');
					flipped = true;
				} else {
					console.error('We have Grown from '+spanElementWidth+' to '+newWidth+' by '+increment );
					if ( newWidth > savedParameters.width )
					{
						console.error('And now we are TOO big!' );
						if (increment > 0) increment *= -1;
						inZone = true;
					}
					
				}
				
			}else{
				
				// SHRANK
				if (increment > 0) 
				{
					console.error('Shrinking from Growing');
					flipped = true;
				}else{
					console.error('We have Shrank from '+spanElementWidth+' to '+newWidth+' by '+increment );
					
					if ( newWidth < savedParameters.width )
					{
						console.error('we are TOO small!' );
						if (increment < 0) increment *= -1;
						inZone = true;
					}
				}
				
			}
			
			// now check to see if we are within the range...
			if ( inZone )
			{
				increment *= 0.75;
				if (increment < MINIMUM_INCREMENT && increment > 0) increment = MINIMUM_INCREMENT;
				else if (increment > -MINIMUM_INCREMENT && increment < 0 ) increment = -MINIMUM_INCREMENT;
				console.error('Reducing Increment to '+increment );
			}
			
			//console.log( increment+ ' Size variation :' + space + 'px calculated size : '+newFontSize+'px' );
            //console.log( counter+'. CurrentFontSize:'+currentFontSize+'px NewFontSize:'+newFontSize+'px Increment:'+increment+'px' );
            //console.log( counter+'. Oversize : '+ (100*spanElementWidth/savedParameters.width)+'%' );
            //console.log( 'Which as a percentage gives : '+percentage+'% or '+newSize+'px' );
           
			spanElementWidth 	= newWidth;
			newSpace 			= savedParameters.width - spanElementWidth;
			
			/*
			// check height is not exceeded first
			if ( (increment > 0) && ( space > 0 ) && ( newSpace < 0 ) )
			{
				console.error('EXIT > Text grew so large that space became negative > spanElementWidth:'+spanElementWidth);
				
				// As we oversized the font fields, we should now reduce it to something we know fits
				spanElement.style.fontSize = currentFontSize + 'px';
			
				// now we must ensure that we exit immediately!
				exit = true;
			//}else if ( (increment < 0) && ( newSpace < settings.tolerance ) && ( newSpace > -settings.tolerance ) ) {
				
				//console.error('EXIT > Text shrank so much! > spanElementWidth:'+newSpace + ' tolerance:' + settings.tolerance );
			}else{
				
				// or increment
				space = newSpace;
			}
			*/
			
			/*
			// check to see if by incrementing we have crossed the extents available
			if ( (increment > 0) && ( space > 0 ) && ( newSpace < 0 ) )
			{
				// We have increased from SMALL to BIG but managed to grow TOO big
				console.error(counter+'. EXIT > Text grew so large that space became negative > spanElementWidth:'+spanElementWidth);
				//spanElement.style.fontSize = currentFontSize + 'px';
				//exit = true;	// size reached!
				
				// flip incrementor and reverse
				increment *= -0.33;
				
			} else if ( (increment < 0) && ( space < 0 ) && ( newSpace > 0 ) ) {
				
				// We have decreased from BIG to SMALL but managed to grow TOO small
				console.error(counter+'. EXIT > Text grew so large that space became negative > spanElementWidth:'+spanElementWidth);
				//spanElement.style.fontSize = currentFontSize + 'px';
				//exit = true;	// size reached!
				
				// flip incrementor and reverse
				increment *= -0.33;
			}
			
			*/
			
			// Check to see if conditions have been met
			if (( newSpace < settings.tolerance ) && ( newSpace > 0 )) 
			{
				console.error('EXIT > Text size reached :'+spanElementWidth + ' tolerance:' + newSpace / settings.tolerance );
				exit = true;	// size reached!
			}
			
			// Too small or Bang on
			if ( exit || (counter++ > COUNTER_LIMIT ) ) 
			{
				console.error('EXIT > Size '+ (100*spanElementWidth/savedParameters.width)+'%' );
				break; 
			}else{
				space = newSpace;
			}
        }
		
		
		// Now centralise in both axis!
		if ( savedParameters.centred )
		{
			//spanElement.style.display = 'block';
			spanElement.style.textAlign = 'center';
			
			var marginTop = (getHeight( element ) - getHeight( spanElement )) * 0.5;
			var marginLeft = (getWidth( element ) - getWidth( spanElement )) * 0.5;
			
			spanElement.style.marginTop = marginTop + 'px';
			spanElement.style.marginLeft = marginLeft + 'px';
			
			console.error(counter+'. > element '+getHeight( element ));
			console.error(counter+'. > spanElement '+getHeight( spanElement ));
			console.error(counter+'. > Centring '+marginTop);
			console.error(counter+'. > Centring '+(marginTop * 0.5) );
		}
		
        spanElement.style.visibility = 'inherit';
	};
	
	
	// And return the instance
	return FontScale;
	
})();


// Tests ====================

var settings = {};
var fs = new FontScale( settings );
/*
// If you do not specify a size, it will use the size of it's parent
var headline = document.getElementById('fixedWidth');
//fs.fixedWidth(headline, '250px');
fs.fixedWidth( headline );

// For fixed size you specify the maximum size allowed
// If no dimension is specified, it will use the size
// of it's parent
var tagline = document.getElementById('fixedSize');
fs.fixedSize( tagline, '250px', '150px', true, true);
//fs.textLine( tagline, "Super Cali Fragalistic Expi Ali Dosious" );

var fixedLine = document.getElementById('fixedLine');
fs.fixedWidth( fixedLine, '250px', true, true);

// For fixed width single line
var subheading = document.getElementById('subHeading');
fs.fixedWidth( subheading, '250px', true);


// Long Heading on many lines centralised in both X and Y direction
var longHeading = document.getElementById('longHeading');
fs.fixedSize( longHeading, '250px', '150px', true, true);

// paragraphs
var longHeading = document.getElementById('paragraphs');
fs.fixedSize(longHeading, '250px', '50px', true, true);
*/

var headline = document.getElementById('fixedWidth');
//fs.fixedWidth(headline, '250px');
fs.fixedWidth( headline, 250, true );