/*
 
Changes made to the template will get copied into your manifest
after running gulp manifest

title 		: #{title}
version		: #{version}
variant		: #{variant}
type		: #{type}
width		: #{width}
height		: #{height}

*/
FT.manifest({
    "filename":"index.html",
    "width":#{width},
    "height":#{height},
    "clickTagCount":1,
	"instantAds":[

		{"name":"textVariable", "type":"text", "default":"This is dynamic text. The image to the left is a dynamic image. These can be updated using the creative interface to make new versions of this ad."},
		{"name":"imageVariable", "type":"image", "default":"images/dynamic_image.jpg"}
		
	]
});
