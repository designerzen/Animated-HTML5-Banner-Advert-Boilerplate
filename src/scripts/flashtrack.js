"use strict";

var FlashTrack = (function(){
	
	var ft;
	
	// Construct
	function FlashTrack()
    {
		ft = new FT();
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
			
			dynamicImage.src = ft.instantAds.imageVariable;	
			dynamicText.innerHTML = ft.instantAds.textVariable;
			
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

var ft = new FlashTrack();
ft.loadContent();
ft.setClickTags('#clicktagholder');