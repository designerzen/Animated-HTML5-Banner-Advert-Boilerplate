// read inside files
var fs = require('fs');
var fileName = './'+"options.json";

if ( !fs.existsSync( fileName ) ) console.error( "No Config Found at "+fileName );
//else console.log('Config Found '+fileName  );

// use fs to load in the options with comments
var stripJsonComments = require('strip-json-comments');
var options = fs.readFileSync(fileName, 'utf-8');
var optionsFiltered = stripJsonComments( options )
	
module.exports = JSON.parse( '{' + optionsFiltered + '}' );