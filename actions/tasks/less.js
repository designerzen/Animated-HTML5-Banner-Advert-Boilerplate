var gulp     = require('gulp');

gulp.task('less', function() {

	var config      	= require('../config');
	var options 		= require('../utils/options.js');
	var sanitise    	= require('../utils/sanitisation.js');
	
	var less 			= require('gulp-less');
	var changed    		= require('gulp-changed');
	var sourcemaps 		= require('gulp-sourcemaps');
	var path 			= require('path');
	var browserSync 	= require('browser-sync');
	var gulpif 			= require('gulp-if');				// conditional compiles
	var filter     	 	= require('gulp-filter');
	var csscomb 		= require('gulp-csscomb');
	var multistream 	= require('gulp-multistream');
	
	// Now features Combining Media Queries Together if "advanced" = true
	var LessPluginCleanCSS = require("less-plugin-clean-css"),
		cleancss = new LessPluginCleanCSS({advanced: true});

	var LessPluginAutoPrefix = require('less-plugin-autoprefix'),
		autoprefix = new LessPluginAutoPrefix({browsers: ["last 2 versions"]});

	var names 			= config.names;
	var structure		= config.structure;
	var setup 			= config.build;
	var source 			= config.source;
	var destination 	= config.destinations[ setup.destination ];
	
	var languages 		= options.languages.length ? options.languages : [''];
	var types 			= options.types;
	var variants		= options.variants.length ? options.variants : [''];
	
	// add missing browser prefixes
	var plugins 		= options.compress.css && setup.compress ? [ autoprefix, cleancss ] : [ autoprefix ];// [ autoprefix, cleancss ] ;
	
	//var destinationsLess = destination.styles;	//folderLocation + '/' + structure.styles;
	
	// destination folders...
	//var destinationsLess = sanitise.getDestinationGlobs( options.brand, types, structure.styles );	//folderLocation + '/' + structure.styles;
	// options.brand, type, variant, language, options.version, '', names.seperator );
	var destinationsLess = sanitise.getDestinationGlobs( options.brand, types, variants, languages, options.version, '', names.seperator, structure.styles, destination.root );	//folderLocation + '/' + structure.styles;

	return 	gulp.src( source.less )
			// only update changed styles
			//.pipe( changed( destination.styles ) )
			// source maps if in debugger mode
			.pipe( gulpif( setup.sourceMaps, sourcemaps.init() ) )
			// compile less files to css
			
			
			// squish : ugly code but smaller
			// NB. As we are running in a deep folder structure,
			// we have to set the working dir in order to get hold of
			// any imports and mixins
			.pipe( less(
				{
					plugins:plugins
				}
			) )
			.on('error', console.error.bind(console) )
			//.pipe( please({ minifier: options.compress }) )
			.pipe( gulpif( setup.sourceMaps, sourcemaps.write( destination.maps ) ) )
			
			// Make the unsquished css more pretty and easier to debug
			.pipe( gulpif( !options.compress.css, csscomb() ) )
			
			// save our to our multiple destination
			//.pipe( gulp.dest( destinationsLess ) )
			.pipe( multistream.apply(undefined, destinationsLess) )
			
			// Filtering stream to only css files
			.pipe( filter('**/*.css') )
			// inject any browsers with this updated css
			.pipe( browserSync.reload({stream:true}) );
});
