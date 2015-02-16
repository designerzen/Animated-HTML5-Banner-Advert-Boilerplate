FT.manifest({
    "filename":"index.html",
    "width":#{width},
    "height":#{height},
    "clickTagCount":1,
	"instantAds":[

		{"name":"textVariable", "type":"text", "default":"This is dynamic text. The image to the left is a dynamic image. These can be updated using the creative interface to make new versions of this ad."},
		{"name":"imageVariable", "type":"image", "default":"images/dynamic_image.jpg"}
		
	],
            
    "expand":{
            
        "width":320,
        "height":480,
        "indentAcross":0,
        "indentDown":0
            
    }
});
