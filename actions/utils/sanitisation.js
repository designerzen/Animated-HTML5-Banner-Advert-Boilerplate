var appendTo = function( copy, data, seperator, seperate ){
	
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
	file = sanitiseName( file );
	
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
var getFolder = function( brand, type, variant, language, prefix, suffix, seperator )
{
	var folder = '';
	
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
	getName:getName,
	getFolder:getFolder,
	getTemplate:getTemplate,
	sanitise:sanitisedFileName
};
