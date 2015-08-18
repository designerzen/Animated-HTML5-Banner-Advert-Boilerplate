/*

Motion Sequence
---------------

This uses GreenSocks TweenMax and TimeLine Classes for all the animated parts
Rather than using CANVAS that will break earlier browsers, instead we animate
DOM elements in realtime using JavaScript.

As the script is loaded AFTER the content, we can use onLoad :)

*/

// Elements
var Animations = (function(){

	'use strict';

   // minifiable shortcuts
    var 
		getElementById = function( id, element ){
			element = element || document;
			return document.getElementById(id);
		},
		getElementByClass = function( id, index ){
			return document.getElementsByClassName(id)[ index || 0 ];
		};
    
	var
		timeline,			// Main Animation that hold the child animations
		variant,			// style... mpu / leaderboard etc
		elements = {}, 		// Home of all of the DOM Node Elements
		backgrounds = {};	// Just another handy container
		
	// Construct
	function Animations()
    {

    }

    // This creates all of our animation elements
    Animations.prototype.assign = function()
    {
        variant 			= getElementById('variant').className || 'unknown';
		elements.content	= getElementById('content');
		elements.first 		= getElementById('first');
		elements.second 	= getElementById('second');
		elements.third 		= getElementById('third');
		elements.fourth 	= getElementById('fourth');
		elements.fifth 		= getElementById('fifth');
		elements.cta 		= getElementById('cta');
		elements.logo 		= getElementById('logo');

        this.construct();
    };

    // This creates all of our animation elements
    Animations.prototype.construct = function()
    {
		var 
			durationZoomIn 		= 1,
			durationZoomOut 	= 1,
			durationFadeIn 		= 1,
			durationFadeOut 	= 1;
			
		// create a home for our animations
 		// timeline = new TimelineLite( {onComplete:this.onFinish, onCompleteParams:["test1", "test2"], onCompleteScope:this } );
 		timeline = new TimelineLite();

        // INTRO =============================================================================
  		// create our INTRO scene
  		var sceneIntro = new TimelineLite();

		
		// Frame # 1 -------------------------------------------------------------------------
		// Fade in 
		sceneIntro.fromTo( elements.first, durationFadeIn, { autoAlpha:0 }, { autoAlpha:1 }, 'logo' );
		// now grow the background Image...
		sceneIntro.fromTo( elements.logo, 1, { autoAlpha:0 }, { autoAlpha:1 }, 'logo' );
		// Fade out (if neccessary)
		sceneIntro.to( elements.first, durationFadeOut, { autoAlpha:0 }, '+='+pauseDuration );
		
		
		// Frame # 2 -------------------------------------------------------------------------
		// Fade in 
		sceneIntro.fromTo( elements.second, durationFadeIn, { autoAlpha:0 }, { autoAlpha:1 } );
		// Fade out (if neccessary)
		sceneIntro.to( elements.second, durationFadeOut, { autoAlpha:0 } , '+='+pauseDuration );
		
		
		// Frame # 3 -------------------------------------------------------------------------
		// Fade in 
		sceneIntro.fromTo( elements.third, durationFadeIn, { autoAlpha:0 }, { autoAlpha:1 } );
		// Fade out (if neccessary)
		sceneIntro.to( elements.third, durationFadeOut, { autoAlpha:0 }, '+='+pauseDuration );
		
		
		// Frame # 4 -------------------------------------------------------------------------
		// Fade in 
		sceneIntro.fromTo( elements.fourth, durationFadeIn, { autoAlpha:0 }, { autoAlpha:1 } );
		// Call to Action
		sceneIntro.fromTo( elements.cta, durationFadeOut, { autoAlpha:0 }, { autoAlpha:1 } );
		// Fade out (if neccessary)
		//sceneIntro.to( elements.fourth, 1, { autoAlpha:0 }, '+='+pauseDuration );
		
		
		
        // TRANSITION ========================================================================
		// create our TRANSITION scene
  		var sceneTransition = new TimelineLite();

        // FINALE ============================================================================
		// create our FINALE scene
  		var sceneFinale = new TimelineLite();

        // Create timeline
  		timeline.add( sceneIntro );
		timeline.add( sceneTransition );
  		timeline.add( sceneFinale );

        // wait before starting the animation!
        timeline.pause();
    };

    // This Kicks off the animation on screen
	Animations.prototype.onFinish = function( scope )
    {

    };

	//
	Animations.prototype.begin = function()
	{
        // hide loader!
        // remove loading class from #content
       	UTIL.removeClass( elements.content , 'loading' );
        timeline.play();
	};

	return Animations;

})();