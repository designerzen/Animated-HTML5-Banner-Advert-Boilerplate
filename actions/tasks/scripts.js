/*

Combine and minify all of our javascript files.

Firstly we compile the VENDOR scripts

THEN we compile the advert scripts

Finally we append the USERS scripts

*/
var gulp = require('gulp');

gulp.task('scripts', function( cb ) {
	
	var newer    		= require('gulp-newer');
	var uglify     		= require('gulp-uglify');
	var gulpif 			= require('gulp-if');
	var concat 			= require('gulp-concat');
	var multistream 	= require('gulp-multistream');
	var stripDebug 		= require('gulp-strip-debug');
	
	var config     		= require('../config');
	var options 		= require('../utils/options.js');
	var sanitise   	 	= require('../utils/sanitisation.js');
	
	var setup 			= config.build;
	var source 			= config.source;
	var destination 	= config.destinations[ setup.destination ];
	
	var names 			= config.names;
	var structure		= config.structure;
	var setup 			= config.build;
	var source 			= config.source;
	var destination 	= config.destinations[ setup.destination ];
	
	var languages 		= options.languages.length ? options.languages : [''];
	var types 			= options.types.length ? options.types : [''];
	var variants		= options.variants.length ? options.variants : [''];
	
	var destinationsScripts = sanitise.getDestinationGlobs( options.brand, types, variants, languages, options.version, '', names.seperator, structure.scripts, destination.root );	//folderLocation + '/' + structure.styles;

	// check to see if the destinations are empty...
	
	console.log( destinationsScripts );
		
	if ( destinationsScripts.length < 1 )
	{
		console.log("Scripts > "+" Nothing to Combine");
		cb();
		
	}else{
		// We DO have named scripts in our folders...
		return gulp.src( source.scripts )
				// Ignore unchanged files
				//.pipe(newer( destination.scripts + '/' + names.scripts))
				
				//.pipe( changed(destination.scripts) ) 
				
				// Combine all files into one file
				// optimise and squeeze Form filezize
				.pipe( concat( names.scripts ) )    
				.pipe( gulpif( options.compress.js, uglify() ) )    
				
				// remove alerts() and console.logs
				.pipe( gulpif( options.compress.js, stripDebug() ) )    

				// save out
				//.pipe( gulp.dest(destination.scripts) );
				.pipe( multistream.apply(undefined, destinationsScripts) );
	}
});
