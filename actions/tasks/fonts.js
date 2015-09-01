var gulp       = require('gulp');

gulp.task('fonts', function() {
	var config      	= require('../config');
	var options 		= require('../utils/options.js');
	var sanitise    	= require('../utils/sanitisation.js');
	
	var changed    		= require('gulp-changed');
	var newer 			= require('gulp-newer');

	var multistream 	= require('gulp-multistream');
	
	var setup 			= config.build;
	var source 			= config.source;
	var destination 	= config.destinations[ setup.destination ];
	
	var names 			= config.names;
	var structure		= config.structure;
	var setup 			= config.build;
	var source 			= config.source;
	var destination 	= config.destinations[ setup.destination ];
	
	var languages 		= options.languages.length ? options.languages : [''];
	var types 			= options.types;
	var variants		= options.variants.length ? options.variants : [''];
	
	var destinationsFonts = sanitise.getDestinationGlobs( options.brand, types, variants, languages, options.version, '', names.seperator, structure.fonts, destination.root );	//folderLocation + '/' + structure.styles;

	return gulp.src( source.fonts )
		//.pipe( newer(destination.fonts) ) // Ignore unchanged files
		//.pipe( changed(destination.fonts) ) // Ignore unchanged files
		//.pipe( gulp.dest(destination.fonts) );
		.pipe( multistream.apply(undefined, destinationsFonts) )
});
