window.onload = function () {
	
	// Preloading commplete!
	
	var anim = new Animations();
	anim.assign();

	// begin animating...
	// defer animation
	// anim.begin();
	
	// Config, Set up and Tests --------------------------------
	var ft = new FlashTrack();
	if (ft.available)
	{
		// Flash Talking is available :)
		ft.loadDynamicContent();
		// else begin animating (if we do not have dynamic content!)
		// anim.begin();
		
		// If it is an expandable advert
		ft.setAsExpandable();
		// Set up click tags for divs :
		ft.setClickTags( '#clicktagholder' );
	}else{
		// Failed to load Flash Talking API
		// Append failed class to body tag
		document.body.className += " failed";
	}
}