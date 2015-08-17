/* 

load in the User's Option.json file

and strip out all of the comments and uneccessary gubbins

*/

var stripJsonComments = require('strip-json-comments');		// strip out useless stuff
var fs = require('fs');										// read inside files
var fileName = './'+"options.json";							// file to read

// Check to see if the file exists and if NOT, throw an error
if ( !fs.existsSync( fileName ) ) 
{
	console.error( "No Config Found at "+fileName );
	console.error( "This file is neccessary and we cannot contiue without it" );
	console.error( "Solution : Recreate the "+fileName+" file");
}

// use fs to load in the options with comments
var options = fs.readFileSync(fileName, 'utf-8');
var optionsFiltered = stripJsonComments( options )

// Export
module.exports = JSON.parse( '{' + optionsFiltered + '}' );