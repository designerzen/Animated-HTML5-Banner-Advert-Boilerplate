"use strict";

var FlashTrack = (function(){
	
	var ft;
	
	// Construct
	function FlashTrack()
    {
		if (FT)
		{
			ft = new FT();
			this.available = true;
		}else{
			this.available = false;
		}
    };
	
	// Injects dynamic content from the flashTalking API via the manifest.js
    FlashTrack.prototype.loadContent = function ()
    {
        var
			container = FT.query("#container"), 
			dynamicText = FT.query("#dynamicText"), 
			dynamicImage = FT.query("#dynamicImage");

		// populate instantAd components
		ft.addEventListener("instantads", function(){
			
			// Set dynamic Images
			if (dynamicImage) dynamicImage.src = ft.instantAds.imageVariable;	
			
			// Set dynamic Text
			if (dynamicText) dynamicText.innerHTML = ft.instantAds.textVariable;
			
			
			// begin animating...
			anim.begin();
		});
    };
	
	// Sets FlashTalking clicktags
    FlashTrack.prototype.setClickTags = function (id)
    {
        var clicker = FT.query(id);
		ft.applyClickTag(clicker, 1);
    };
	
	return FlashTrack;
   
})();

// Set up and test
var ft = new FlashTrack();
if (ft.available)
{
	// Flash Talking is available :)
	ft.loadContent();
	ft.setClickTags('#clicktagholder');
}else{
	// Failed to load Flash Talking API
	// Append failed class to body tag
	document.body.className += " failed";
}