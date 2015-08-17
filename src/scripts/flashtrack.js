/////////////////////////////////////////////////////////////////
//
// Flash Talking API Wrapper
// --------------------------------------------------------------
// This is where Instant Ads, Dynamic Content and Expandables
// are configured that depend on the FlashTalking API.
//
// Modify this as much as is neccessary for your campaign
//
/////////////////////////////////////////////////////////////////

var FlashTrack = (function(){
	
	'use strict';
	
	var 
        EVENT_EXPANDED = "expanded",
        EVENT_CONTRACTED = "contract",
        EVENT_INSTANT_ADS = "instantads",
		clickCounter = 0,
        ft;
    
    /////////////////////////////////////////////////////////////////
	// Construct
    /////////////////////////////////////////////////////////////////
	function FlashTrack()
    {
		if (typeof FT == 'function')
		{
			ft = new FT();
			this.available = true;
		}else{
			this.available = false;
		}
    }
	
    /////////////////////////////////////////////////////////////////
	// Injects dynamic content from the flashTalking API 
    // via the manifest.js if Instant Ads is set up
    /////////////////////////////////////////////////////////////////
    FlashTrack.prototype.loadDynamicContent = function ()
    {
        var
			dynamicText = FT.query("#dynamicText"), 
			dynamicImage = FT.query("#dynamicImage");

		// populate instantAd components
		ft.addEventListener( EVENT_INSTANT_ADS, function(){
			
			// Set dynamic Images
			if (dynamicImage) dynamicImage.src = ft.instantAds.imageVariable;	
			
			// Set dynamic Text
			if (dynamicText) dynamicText.innerHTML = ft.instantAds.textVariable;

			// begin animating...
			anim.begin();
		});
    };
	/////////////////////////////////////////////////////////////////
	// Sets FlashTalking Click Tags and Click Throughs
    /////////////////////////////////////////////////////////////////
    FlashTrack.prototype.setClickTags = function ( id , uniqueNumber )
    {
        var n = uniqueNumber ? uniqueNumber : clickCounter++,
            clicker = FT.query(id);
        
		ft.applyClickTag( clicker, n );
    };
	
    /////////////////////////////////////////////////////////////////
    // This is where we expand the advert into new sizes
    // Expand and Contract
    /////////////////////////////////////////////////////////////////
    FlashTrack.prototype.setAsExpandable = function ()
    {
        var 
            unexpanded = FT.query("#unexpanded"),
			expanded = FT.query("#expanded"),
			close = FT.query("#close"),
            container = FT.query("#container");
			
		var 
            // Advert has been expanded
            onExpand = function(e){
                UTIL.addClass( container, EVENT_EXPANDED );
                ft.expand();
			},
            // Advert is to be contracted
			onContract = function(e){
				 
                UTIL.removeClass( container, EVENT_EXPANDED );
                if(e && e.type) {
                	ft.contract();
                }
			};
        
        // Event handlers
        ft.addEventListener( EVENT_CONTRACTED , onContract );

        // set up the EXPAND and CONTRACT buttons
        ft.applyButton( unexpanded, onExpand );
        ft.applyButton( close, ft.contract );
        
        // expanded view now becomes a clicktag :P
        ft.applyClickTag(expanded);
    };
    
	return FlashTrack;
   
})();

