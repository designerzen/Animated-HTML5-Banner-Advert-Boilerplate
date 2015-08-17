var gulp       = require('gulp');

gulp.task('icons', function() {
	
	var newer 			= require('gulp-newer');
	var changed    		= require('gulp-changed');
	var imagemin   		= require('gulp-imagemin');
	var browserSync 	= require('browser-sync');
	var multistream 	= require('gulp-multistream');
	
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
	var types 			= options.types;
	var variants		= options.variants;
	
	var destinationsIcons = sanitise.getDestinations( options.brand, types, variants, languages, options.version, '', names.seperator, structure.icons, destination.root );	//folderLocation + '/' + structure.styles;

	return gulp.src( source.icons )
			//.pipe( newer(destination.icons) ) 						// Only overwrite older files
			//.pipe( changed(destination.icons) ) 						// Ignore unchanged files
			.pipe( gulpif( !options.compress.images, imagemin() ) )		// Optimize
			//.pipe( gulp.dest(destination.icons) )
			.pipe( multistream.apply(undefined, destinationsIcons) )
			.pipe( browserSync.reload({stream:true}) );
});
