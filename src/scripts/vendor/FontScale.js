// Internet Explorer 8 Poly Fill
if (!window.getComputedStyle) 
{
	window.getComputedStyle = function(el, pseudo) {
		this.el = el;
		this.getPropertyValue = function(prop) {
			var re = /(\-([a-z]){1})/g;
			if (prop == 'float') prop = 'styleFloat';
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



var FontScale = (function(){

	"use strict";
	
	// Private ===================================================================
	
	// absolute maximum times we try to reduce the size...
	var COUNTER_LIMIT = 100;
	
	// Extends the options
	var extend = function (a, b){
		for(var key in b)
			if(b.hasOwnProperty(key))
				a[key] = b[key];
		return a;
	};
	
	// Set minimum and maximum width thresholds 
	// stop resizing text once the element width becomes smaller than 500px or larger than 1200px.
	var settings = {
		baseFont 		: 14,
		tolerance		: 3,
		maxFont 		: 100,
		minFont 		: 10,
		wholeNumbers	: false
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
	
	// Get the Width of an element
	var getWidth = function (element ){
		if (element.clientWidth) return element.clientWidth;
		if (element.offsetWidth) return element.offsetWidth;
		return element.getBoundingClientRect().width;
	};
	
	// Get the Height of an element
	var getHeight = function (element ){
		if (element.clientWidth) return element.clientHeight;
		if (element.offsetWidth) return element.offsetHeight;
		return element.getBoundingClientRect().height;
	};

	
	
	// Get the size of a font as numerals
	var getFontSize = function( element )
	{
		var size = getStyle(element, 'fontSize');
		return parseFloat( size.match(/[0-9]+/g, '')[0]);	
	};
	
	var addSuffix = function( measure , measurements ){
		var hasSuffix = measure.indexOf(measurements) != -1;
		if (hasSuffix > -1) return measure;
		else return measure + measurements;
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
	//
	//////////////////////////////////////////////////////////////////////////////////////////////////////
    FontScale.prototype.fixedSize = function( element, width, height, centraliseX, centraliseY )
    {
		// if we have a width specified in the arguments, we should set this width directly onto the element
		if (height)
		{
			height = addSuffix( width, 'px' );			// add px to width and height if not available
			element.style.height = height;				// overwrite existing height
			//console.log('Setting height '+height+' to '+element.style.height);
		}
		
		if (width) 
		{
			width = addSuffix( width, 'px' );			// add px to width and height if not available
			element.style.width = width;				// overwrite existing width
			//console.log('Setting width '+width+' to '+element.style.width);
		}
		
		// before we do anything, let's figure out some logistics,
		var savedParameters = {
			position:		getStyle(element, 'position' ),
			display:		getStyle(element, 'display' ),
			size:			getFontSize( element ),
           	width:			getWidth(element),
			height:			getHeight(element),
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

			maxWidth 				= savedParameters.width,							// check to see if the 'width' argument is set, and if so determine the percentage size
			maxHeight 				= savedParameters.height,							// check to see if the 'height' argument is set, and if so determine the percentage size

			spaceX 					= maxWidth - spanElementWidth,						// how much left over horizontal space is there?
			spaceY 					= maxHeight - spanElementHeight,					// how much left over vertical space is there?
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
			
			var newSpaceY 				= maxHeight - spanElementHeight;
			
			// check height is not exceeded first
			if ( (increment > 0) && ( spaceY > 0 ) && ( newSpaceY < 0 ) )
			{
				console.error('Text grew so large that space became negative > spanElementWidth:'+spanElementWidth);
				
				// now we must ensure that we exit immediately!
				exit = true;
				
			}else{
				
			}
			
			spaceX 				    	= maxWidth - spanElementWidth;
			spaceY 				    	= newSpaceY;
			
			
			console.log( increment+' . Space Y : ' + spaceY );
			
			// early exit if match found or issues are encountered
			if ( exit || (counter++ > COUNTER_LIMIT ) ) break;   
        }
		
		if ( savedParameters.centredX || savedParameters.centredY )
		{
			spanElement.style.display = 'block';
		}
		
		// Now centralise if there is space left over
		if ( savedParameters.centredX )
		{
			spanElement.style.textAlign = 'center';
			spanElement.style.marginLeft = spaceX * 0.5 + 'px';
		}
		
		if ( savedParameters.centredY )
		{
			spanElement.style.marginTop = spaceY * 0.5 + 'px';
		}
		
		// and make element visible once again
        spanElement.style.visibility = 'inherit';
	};
	
	
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////
	// 
	// If width is not set, read in width from element and set them absolutely
	// If width is set, resize the element to this size...
	// 
	//////////////////////////////////////////////////////////////////////////////////////////////////////
    FontScale.prototype.fixedWidth = function( element, width, centralise )
    {
		// if we have a width specified in the arguments, we should set this width directly onto the element
		if (width) 
		{
			element.style.width = width;
		}
		
		// before we do anything, let's figure out some logistics,
		var savedParameters = {
			position:		getStyle(element, 'position' ),
			display:		getStyle(element, 'display' ),
			size:			getFontSize( element ),
           	width:			getWidth(element),
			height:			getHeight(element),
			text:			element.innerHTML,
			centred:		centralise || false
		};
		
		console.error( savedParameters );
		
		// let us add a <span> tag around the internals of the element
		// this will be useful in scaling things up later on
		element.innerHTML	    	= '<span>'+savedParameters.text+'</span>'

		// get span element
		var 
			newWidth 			= savedParameters.width,
			spanElement			= element.getElementsByTagName('span')[0];			// fetch child span element
		
		spanElement.style.whiteSpace = 'nowrap';
		
		var 
			spanElementWidth 	= getWidth( spanElement ),							// span element width
			maxWidth 			= newWidth,											// check to see if the 'width' argument is set, and if so determine the percentage size
			space 				= maxWidth - spanElementWidth,						// how much left over space is there?
			exit				= false,
			increment			= 1,
			counter				= 0;
	
		if ( space < 0 ) 
		{
			increment = -1;
		}
		
		// first set element to be hidden...
		spanElement.style.visibility = 'hidden';
		
        // now loop through and scale the font
        while (( space > settings.tolerance )||( space < 0 ))
        {
			var 
				currentFontSize 	= getFontSize( spanElement ),
				newSize             = currentFontSize + increment,
				calculatedSize		= newSize,
				percentage			= 100 * newSize / settings.baseFont;
            
			//parentElement.style.fontSize 	= '20'+'px';
            console.log( 'maxWidth : '+maxWidth+' newWidth : '+spanElementWidth + ' currentFontSize:'+currentFontSize );
            console.log( 'Size variation :' + space + 'px variance calculatedSize : '+calculatedSize+'px' );
            console.log( 'Which as a percentage gives : '+percentage+'% or '+newSize+'px' );
            console.log( 'Current : '+currentFontSize+'px New '+newSize+'px' );
            
			// User wants integers 
			if ( settings.wholeNumbers )
			{
				newSize = parseInt( newSize );
			}
			
			// ensure that the new sizes do not exceed our settings...
			// make sure we don't extend beyond our settings
			if (newSize > settings.maxFont)
			{
				newSize = settings.maxFont;
				exit = true;
			}else if (newSize < settings.minFont){ 
				newSize = settings.minFont;
				exit = true;
			}
			
			// original size is 14px
			spanElement.style.fontSize = newSize + 'px';
			//spanElement.style.fontSize = percentage + '%';
			spanElementWidth 	    = getWidth( spanElement );
            
			var newSpace 			= maxWidth - spanElementWidth;
			
			// check height is not exceeded first
			if ( (increment > 0) && ( space > 0 ) && ( newSpace < 0 ) )
			{
				console.error('Text grew so large that space became negative > spanElementWidth:'+spanElementWidth);
				
				// now we must ensure that we exit immediately!
				exit = true;
				
			}else{
				
			}
			
			space = newSpace;
			
			// Too small or Bang on
			if ( exit || (counter++ > COUNTER_LIMIT ) ) break;   
        }
		
		if ( savedParameters.centredX || savedParameters.centredY )
		{
			spanElement.style.display = 'block';
			spanElement.style.textAlign = 'center';
		}
		
		if ( savedParameters.centred )
		{
			spanElement.style.marginTop = space * 0.5 + 'px';
		}
		
        spanElement.style.visibility = 'inherit';
	};
	
	return FontScale;
	
})();

var fs = new FontScale();

var headline = document.getElementById('headline');
fs.fixedWidth( headline, '450px' );
//fs.fixedWidth( headline );

var tagline = document.getElementById('tagline');
fs.fixedSize( tagline, '250px', '150px', true, true );
//fs.textLine( tagline, "Super Cali Fragalistic Expi Ali Dosious" );

var subheading = document.getElementById('subheading');
fs.fixedWidth( subheading, '150px', true );
