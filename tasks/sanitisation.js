

///////////////////////////////////////////////////////////////////////////////////
// File name format for creating distributions
// You can set this to however your campaign needs
// Defaults to brand-type-variant.zip
// Fetch and create a nice filename that excludes punctuation
// and spaces are a no-go too...
///////////////////////////////////////////////////////////////////////////////////
var getFileName = function( brand, type, variant, suffix, extras ){
	// optional
	extras = extras || "";
	var name = extras + brand +'-'+type +'-'+variant;
	// remove spaces and replace with underscores
	name = name.replace(/ +?/g, '_');
	// swap out full stops for hyphens (mainly for versioning)
	name = name.replace(/\./g, "-");
	// remove not allowed characters...
	name = name.replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#\$%&\(\)\*\+,\/:;<=>\?@\[\]\^_`\{\|\}~]/g, "_");
	// make sure we have a suffix if needed
	if (suffix) name += suffix;
	return name.toLowerCase();
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
