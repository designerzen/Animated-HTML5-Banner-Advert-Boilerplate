FT.manifest({
    "filename":"index.html",
    "width":300,
    "height":250,
    "clickTagCount":1,
    "trackingEvents":[
        {
            "name":"imp_sku",
            "type":"string"
        },
        {
            "name":"click_sku",
            "type":"string"
        },
        {
            "name":"feed_error",
            "type":"string"
        }
    ],
	"instantads":[
		{"name":"textVariable", "type":"text", "default":"This is dynamic text. The image to the left is a dynamic image. These can be updated using the creative interface to make new versions of this ad."},
		{"name":"imageVariable", "type":"image", "default":"images/dynamic_image.jpg"}
	]
});
