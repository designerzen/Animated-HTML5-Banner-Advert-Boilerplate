/*

Converts a packaged bundle into their relevant zips that are ready

for uploading to the portal API

*/

var gulp       = require('gulp');

gulp.task('zip', function(cb) {
	
	// Options & Config
	var config     	= require('../config.js');
	var options 	= require('../utils/options.js');
	var sanitise    = require('../utils/sanitisation.js');
	var size     	= require('../utils/sizes.js');
	
	// Tools
	var gulpif 		= require('gulp-if');				// If ... Else ...
	var zip 		= require('gulp-zip');				// zip files
	var replace 	= require('gulp-replace');			// replace content within files
	var fs 			= require('fs');					// read inside files
	var rename 		= require('gulp-rename');			// rename files
	var merge 		= require('merge-stream');			// combine multiple streams!
	var filesize 	= require('gulp-size');  			// measure the size of the project (useful if a limit is set!)
	var expect 		= require('gulp-expect-file');		// expect a certain file (more for debugging)

	var setup 		= config.build;
	var names 		= config.names;
	var source 		= config.source;
	var destination = config.destinations[ setup.destination ];
	
	// These are set from options
	var types 		= options.types;
	var variants	= options.variants;
	var languages 	= options.languages.length ? options.languages : [''];
	var names 		= config.names;
	
	var type 		= types[0];
	var variant 	= variants[0];
	var language 	= languages[0];
	
	var glob = '**/*';
	
	// Stream merger
	var merged = merge();
	
	
	// Loop through variants
	for ( var v=0, a=variants.length; v < a; v++)
	{
		variant = variants[v];
		console.log( 'ZIPPING > Variant '+(v+1)+' / '+a+' : '+variant.toUpperCase() +' in '+languages.length+' languages');
		console.log('=======================================================');
		
		// Loop through languages (only if languages are not empty!)
		for ( var l=0, q=languages.length; l < q; l++)
		{
			language = languages[l];
			if (language.length > 1) console.log( 'ZIPPING > Language '+(l+1)+' / '+q+' : '+language.toUpperCase() );
				
			// Loop through Types (MPU/Leaderboard/Skyscraper)
			for (var t = 0, e=types.length; t < e; t++)
			{
				// Standardised file name
				var type = types[t];
				//var size = sizes[ type ];
				
				console.log( 'ZIPPING > Type '+t +'/'+ e +' : ' + type );
				
				// brand, type, variant, language, prefix, suffix, extension, seperator
				var folderName = sanitise.getFolder( options.brand, type, variant, language, options.version, '', names.seperator );
				var folderLocation = destination.root + '/'+ folderName + '/';
				
				var dimensions = size.toSize( type );
				
				var fileName = sanitise.getZip( options.brand, type, variant, language, options.version, dimensions, "",  options.seperator );
				
				
				var imageGlob = folderLocation + glob;
				
				// showFiles : Displays the size of every file instead of just the total size.
				var sizer = filesize( {title: destination.root + '/' + fileName, showFiles:true } );
				
				// Create a ZIP of ALL RELEVANT FILES in FOLDER
				var zipStream = gulp.src( imageGlob )
					.pipe( zip(fileName) )
					// console.log the filesize! :P
					.pipe( sizer )
					// save to destination folder
					.pipe( gulp.dest( destination.root ) );
				
				
				//console.log( sizer );
				console.log( sizer.prettySize );
				//console.log( sizer.size.prettySize );
				console.log( 'ZIPPING > Size ['+sizer.prettySize+'] '+folderLocation+' -> ' + destination.root + '/' + fileName );
					
				merged.add( zipStream );
				
			}
			console.log( '' );
		}
	}
	
	// force callback!
	//cb();
	
	return merged;
});
