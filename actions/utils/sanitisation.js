var REMOVER = /\.[^/.]+$/;


///////////////////////////////////////////////////////////////////////////////////
// add Text to a string if conditions are met
///////////////////////////////////////////////////////////////////////////////////
var appendTo = function( copy, data, seperator, seperate )
{
	seperator = seperator || "-";
	
	if (data && data.length) 
	{
		// check to see if we have a trailing seperator...
		// we DO NOT, so let us add one before our new copy
		if (seperate != false) if ( copy.slice(-1) != seperator ) copy += seperator;
		// add the data as it is NOT empty
		copy += data;
	}
	return copy;
};

///////////////////////////////////////////////////////////////////////////////////
// Take out all characters that are not allowed in the API
// This includes dots and spaces and uppercase things too I guess
///////////////////////////////////////////////////////////////////////////////////
var sanitiseName = function( unsanitised )
{
	// remove spaces and replace with underscores
	unsanitised = unsanitised.replace(/ +?/g, '_');
	// swap out full stops for hyphens (mainly for versioning)
	unsanitised = unsanitised.replace(/\./g, "-");
	// remove not allowed characters...
	unsanitised = unsanitised.replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#\$%&\(\)\*\+,\/:;<=>\?@\[\]\^_`\{\|\}~]/g, "_");
	// sent it out
	return unsanitised;
};

///////////////////////////////////////////////////////////////////////////////////
//
///////////////////////////////////////////////////////////////////////////////////
var getTemplate = function( type, variant, language, suffix, seperator )
{
	var file = type;
	seperator = seperator || "-";
	// If we have a variant, add it here
	if (variant.length) file += seperator + variant;
	// same with the language suffix
	if (language.length) file += seperator + language;
	// and add our manifest title
	
	// add extra bits onto the end based on whether flags exist
	file += suffix;
	return file;
};

///////////////////////////////////////////////////////////////////////////////////
// This is the final zip output file.
// Best served in the format :
// width x height _ variant _ year
// options.brand, type, variant, language, options.version, "", ".zip",  options.seperator );
// Feel free to customize this however You feel Best appropriate
// eg. Online_Bnr_300x250_dynamic_1D_4S_Captify_abz.swf
///////////////////////////////////////////////////////////////////////////////////
var getZip = function( brand, type, variant, language, version, prefix,suffix, seperator )
{
	var file = '';

	// Prefix!
	file = appendTo( file, prefix, seperator, false  );
	
	// If we have a variant, add it here
	file = appendTo( file, brand, seperator );
	
	// add type
	file = appendTo( file, type, seperator );
	
	// If we have a variant, add it here
	file = appendTo( file, variant, seperator );
	
	// same with the language suffix
	file = appendTo( file, language, seperator );
	
	// Suffix endings
	file = appendTo( file, suffix, seperator );
	
	file = appendTo( file, version, seperator );
	
	// sanitise all but extension...
	file = sanitiseName( file );
	
	// make sure we have an extension and append
	file += '.zip';
	
	return file.toLowerCase();
};


///////////////////////////////////////////////////////////////////////////////////
// File name format for creating distributions
// You can set this to however your campaign needs
// Defaults to brand-type-variant.zip
// Fetch and create a nice filename that excludes punctuation
// and spaces are a no-go too...
// and it turns out... dots too!
///////////////////////////////////////////////////////////////////////////////////
var getName = function( brand, type, variant, language, prefix, suffix, extension, seperator )
{
	var file = '';

	// Prefix!
	file = appendTo( file, prefix, seperator, false  );
	
	// If we have a variant, add it here
	file = appendTo( file, brand, seperator );
	
	// add type
	file = appendTo( file, type, seperator );
	
	// same with the language suffix
	file = appendTo( file, language, seperator );
	
	// If we have a variant, add it here
	file = appendTo( file, variant, seperator );
	
	// Suffix endings
	file = appendTo( file, suffix, seperator );
	
	// sanitise all but extension...
	// file = sanitiseName( file );
	
	// make sure we have an extension and append
	if (extension) file += extension;
	
	return file.toLowerCase();
};

///////////////////////////////////////////////////////////////////////////////////
// File name format for creating distributions
// You can set this to however your campaign needs
// Defaults to brand-type-variant.zip
// Fetch and create a nice filename that excludes punctuation
// and spaces are a no-go too...
// and it turns out... dots too!
///////////////////////////////////////////////////////////////////////////////////
var sizes     	= require('./sizes.js');
	
var getFolder = function( brand, type, variant, language, prefix, suffix, seperator )
{
	var folder = '';
	var dimensions = sizes.toSize( type );
				
	// Prefix!
	folder = appendTo( folder, prefix, seperator, false  );
	
	// If we have a variant, add it here
	folder = appendTo( folder, brand, seperator  );
	
	// add type
	folder = appendTo( folder, type, seperator  );
	
	// same with the language suffix
	folder = appendTo( folder, language, seperator  );

	// If we have a variant, add it here
	folder = appendTo( folder, variant, seperator  );
	
	// Suffix endings
	folder = appendTo( folder, suffix, seperator  );
	
	// sanitise all but extension...
	folder = sanitiseName( folder );

	return folder.toLowerCase();
};


///////////////////////////////////////////////////////////////////////////////////
// Fetch an ARRAY of all destinations root folders such as destinations/mpu/ etc.
///////////////////////////////////////////////////////////////////////////////////

var gulp = require('gulp');
var getDestinationGlobs = function( brand, types, variants, languages, prefix, suffix, seperator, subFolder, parent )
{
	var destinations = [];
	if (!variants) variants = [];
	if (!languages) languages = [];
	// Languages!
	for ( var z=0, p=languages.length; z < p; ++z)
	{
		var language = languages[z];
		
		// Variants :
		// loop through variants Array and create our subFolder list
		for ( var v=0, l=variants.length; v < l; ++v)
		{
			var variant = variants[v];
			
			
			// Types : 
			// loop through types Array and create our subFolder list
			for ( var t=0, q=types.length; t < q; ++t)
			{
				var type = types[t];
				// ( brand, type, variant, language, prefix, suffix, seperator )
				var destination = parent + '/' + getFolder( brand, type, variant, language, prefix, suffix, seperator ) + '/' + subFolder;
				var glob = gulp.dest( destination ) ;
				destinations.push( glob );
			}
			
		}
		
		
	}
	return destinations;
};

///////////////////////////////////////////////////////////////////////////////////
// Fetch an ARRAY of all destinations root folders such as destinations/mpu/ etc.
///////////////////////////////////////////////////////////////////////////////////
var getDestinationPaths = function( brand, types, variants, languages, prefix, suffix, seperator, subFolder, parent )
{
	var destinations = [];
	if (!variants) variants = [];
	if (!languages) languages = [];
	// Languages!
	for ( var z=0, p=languages.length; z < p; ++z)
	{
		var language = languages[z];
		
		// Variants :
		// loop through variants Array and create our subFolder list
		for ( var v=0, l=variants.length; v < l; ++v)
		{
			var variant = variants[v];
			
			
			// Types : 
			// loop through types Array and create our subFolder list
			for ( var t=0, q=types.length; t < q; ++t)
			{
				var type = types[t];
				// ( brand, type, variant, language, prefix, suffix, seperator )
				var destination = parent.length ? parent + '/' : '';
				destination += getFolder( brand, type, variant, language, prefix, suffix, seperator ) + '/' + subFolder;
				
				destinations.push( destination );
			}
			
		}
		
		
	}
	return destinations;
};

///////////////////////////////////////////////////////////////////////////////////
// Detemine the file 
///////////////////////////////////////////////////////////////////////////////////
var determineDataFromFilename = function( path, options, seperator )
{
	// let us split by multiple seperators including the user defined one...
	//var seperators 		= [ '\.', '\-', '\_' ];//
	var seperators 		= [ '.','\\-' ];//,'\\-'
	
	// check to see if seperator is specified and is not in our seperators....
	if ( seperators.indexOf(seperator) === -1 ) seperators.push( seperator );
	
	//var divider 		= "/(?:"+seperators+")+/";
	//var divider 		= "(?:"+ seperators.join('|') +")+";
	//var reg 			= new RegExp( seperators.join('|'), 'g' );
	var reg 			= new RegExp('[' + seperators.join('') + ']+', 'g');
	
	// extrapolate the file name from the glob
	// this replace simply removes the file extension
	var data 			= {};
	var filename 		= path.replace(REMOVER, "");
	var parts 			= filename.split( reg );
	var count 			= 0;
	
	data.type 			= parts[ count ];
	
	// check to see if we have any language files specified...
	if ( parts.length > 1 )
	{
		data.language = options.languages.length > 0 ? parts[ ++count ].replace(REMOVER, "") : '';
		data.variant = options.variants.length > 0 ? parts[ ++count ] : '';
	}else{
		data.language = '';
		data.variant = '';
	}
	
	return data;
};


//
// Feed this is a file name and it will return the type, variant and language as an object
// IF it can work them out...
// IF NOT, it will just return empty object entries
var determineImageDestination = function( file, options )
{
	// then remove the file extension
	var data 			= {};
	data.name 			= file;
	data.variant		= '';
	data.language 		= '';
	data.extension		= file.substr(file.lastIndexOf('.')+1);
	
	var sortedTypes = options.types.sort(function(a, b){
	  return b.length - a.length; // ASC -> a - b; DESC -> b - a
	});
	
	
	// Only test for TYPE at this point...
	var types = sortedTypes.join("|");
	// We want it to consider the uppercase variants too
	var regex = new RegExp(types,'ig');	// i for ignore case, g for global match
	
	var test = regex.test( file );
	if ( test ) 
	{
		var match = file.match( regex );
		// At least one match
		//console.log( "MATCH " , match );
		data.match = true;
		// determine match...
		data.type = match[0];
	}else{
		//console.log( "NON-MATCH " + file );
		data.match = false;
		data.type = 'unknown';
	}
	
	return data;
};

///////////////////////////////////////////////////////////////////////////////////
// File name format for creating templates
///////////////////////////////////////////////////////////////////////////////////
var sanitisedFileName = function( brand, type, variant, suffix ){
	var name = type + '.'+ brand +'.'+variant;
	// remove spaces
	name = name.replace(/ +?/g, '_');
	// remove not allowed characters...
	// make sure we have a suffix if needed
	if (suffix) name += suffix;
	return name.toLowerCase();
};


// Public
module.exports = {
	determineDataFromFilename:determineDataFromFilename,
	determineImageDestination:determineImageDestination,
	getName:getName,
	getFolder:getFolder,
	getDestinationPaths:getDestinationPaths,
	getDestinationGlobs:getDestinationGlobs,
	getTemplate:getTemplate,
	getZip:getZip,
	sanitise:sanitisedFileName
};
