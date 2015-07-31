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
	var languages 	= options.languages;
	var names 		= config.names;
	
	var type 		= types[0];
	var variant 	= variants[0];
	var language 	= languages[0];
	
	// Standardised file name
	// brand, type, variant, language, prefix, suffix, extension, seperator
	var fileName 	= sanitise.getName( options.brand, type, variant, language, options.version, "", ".zip",  options.seperator );
	
	console.log( fileName );
	
	var glob = '**/*';
	
	// Stream merger
	var merged 		= merge();
	
	// force callback!
	cb();
	
	/*
	// Create a ZIP of ALL RELEVANT FILES in FOLDER
	var zipStream = gulp.src( folder + glob )
		.pipe( zip(fileName) )
		// console.log the filesize! :P
		.pipe( filesize( {title:fileName, showFiles:false } ) )
		.pipe( gulp.dest( RELEASE_FOLDER ) );
	*/
});
