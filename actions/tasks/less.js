var gulp     = require('gulp');

gulp.task('less', function() {

	var config     	= require('../config');
	var less 		= require('gulp-less');
	var changed    	= require('gulp-changed');
	var sourcemaps 	= require('gulp-sourcemaps');
	var path 		= require('path');
	var browserSync = require('browser-sync');
	var gulpif 		= require('gulp-if');				// conditional compiles
	var filter      = require('gulp-filter');
	var csscomb 	= require('gulp-csscomb');
	
	// Now features Combining Media Queries Together if "advanced" = true
	var LessPluginCleanCSS = require("less-plugin-clean-css"),
		cleancss = new LessPluginCleanCSS({advanced: true});

	var LessPluginAutoPrefix = require('less-plugin-autoprefix'),
		autoprefix = new LessPluginAutoPrefix({browsers: ["last 2 versions"]});

	var setup 		= config.build;
	var source 		= config.source;
	var destination = config.destinations[ setup.destination ];
	var plugins 	= setup.compress ? [ autoprefix, cleancss ] : [ autoprefix ];// [ autoprefix, cleancss ] ;

	return 	gulp.src( source.less )
			// only update changed styles
			//.pipe( changed( destination.styles ) )
			// source maps if in debugger mode
			.pipe( gulpif( setup.sourceMaps, sourcemaps.init() ) )
			// compile less files to css
			// add missing browser prefixes
			// squish : ugly code but smaller
			// NB. As we are running in a deep folder structure,
			// we have to set the working dir in order to get hold of
			// any imports and mixins
			.pipe( less(
				{
					compress:setup.compress,
					plugins:plugins
				}
			) )
			.on('error', function(err) {
                console.error( 'Error with LESS.js', err.message);
            })
			//.pipe( please({ minifier: options.compress }) )
			.pipe( gulpif( setup.sourceMaps, sourcemaps.write( destination.maps ) ) )
			// Make the unsquished css more pretty and easier to debug
			.pipe( gulpif( !setup.compress, csscomb() ) )
			// save our to our destination
			.pipe( gulp.dest( destination.styles ) )
			// Filtering stream to only css files
			.pipe( filter('**/*.css') )
			// inject any browsers with this updated css
			.pipe( browserSync.reload({stream:true}) );
});
