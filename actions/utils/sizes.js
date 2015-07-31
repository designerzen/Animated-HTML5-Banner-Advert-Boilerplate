
///////////////////////////////////////////////////////////////////////////////////
// Determine the string for this dimension from the type of the advert
// eg. convertToSize( 'mpu' ) -> '300x250'
///////////////////////////////////////////////////////////////////////////////////
var convertToSize = function( size, seperator ){
    
	seperator = seperator || 'x';
    // If we have a config file with custom sizes set up
    var configSize = config.sizes[ size ];
    if (configSize) return configSize.w + seperator + configSize.h;
    
    // return the string of the sizes based on the type variant
    // for if the config file is corrupt or not set up correctly
    switch ( size.toLowerCase() )
    {
        case "mpu":                 return "300"+seperator+"250";
        case "halfpage":            return "300"+seperator+"600";
		case "leaderboard":         return "728"+seperator+"90";
        case "skyscraper":          return "120"+seperator+"600";
        case "wideskyscraper":      return "160"+seperator+"600";
        case "mobilebanner":        return "320"+seperator+"50";
        case "mobilempu":           return "300"+seperator+"250";
        case "mobileleaderboard":   return "728"+seperator+"90";
    }
};

///////////////////////////////////////////////////////////////////////////////////
// Determine if this is a mobile advert or a desktop one
// eg. convertToDevice( 'mpu' ) -> 'desktop'
///////////////////////////////////////////////////////////////////////////////////
var convertToDevice = function( size ){
    size = size.toLowerCase();
    if ( size.indexOf('mobile') )
    {
        return "mobile";
    }
    
    switch (size )
    {
        case "mpu": 
        case "halfpage": 
		case "leaderboard":
        case "skyscraper":
        case "wideskyscraper":      
            return "desktop";
            
        case "mobilebanner":
        case "mobilempu":
        case "mobileleaderboard":
            return "mobile";
    }
};

module.exports = {
	toSize:convertToSize,
	toType:convertToDevice
};
