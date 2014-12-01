/*

This handles the compilation of the source elements :

Less 			-> 		CSS 3
Jade 			-> 		HTML 5
JavaScript		-> 		JS ( Squished, uglified, concatanated )

For help with Globbing Patterns (the defaults should be fine!) check out :
http://gruntjs.com/configuring-tasks#globbing-patterns

*/

// =======================---------------- CONFIGURATION --------------------

// Set up paths here (for this boilerplate, you should not have to alter these)
var SOURCE_FOLDER 			= 'src/';		// Source files Root
var BUILD_FOLDER 			= 'build/';		// Where the initial build occurs (debugable)
var DISTRIBUTION_FOLDER 	= 'dist/';		// Once debugging is complete, copy to server ready files here
var RELEASE_FOLDER 			= 'release/';	// Convert to distributable zips

// Default variations for templating
var defaultTypes =
[
  "mpu",
  "leaderboard",
  "skyscraper"
];


// Default dimensions for banner adverts
// from http://notwothesame.com/banner-sizes.htm
// nb. feel free to resize these for your project!
var sizes =
{
	// Wide and short advert
	leaderboard : {
		w:728,
		h:90
	},
	
	// Square advert
	mpu : {
		w:300,
		h:250
	},
	
	// Tall and thin advert
	skyscraper : {
		w:120,
		h:600
	},
	
	// Tall and fat advert
	wideSkyscraper : {
		w:160,
		h:600
	},
	
	// Half a page advert
	halfPage : {
		w:300,
		h:600
	},
	
	// Regular sized banner
	banner : {
		w:468,
		h:60
	},
	
	// Small vertical banner
	verticalBanner : {
		w:120,
		h:240
	},
		
	// Half a banner
	halfBanner : {
		w: 234,
		h: 60
	}
};


// SOURCE_FOLDER+'scripts/vendor/**/*.js',
// Where do our source files live?
var source = {
	scripts : [ SOURCE_FOLDER+'scripts/!(manifest)*.js' ],
	styles 	: SOURCE_FOLDER+'less/style.less',
	jade 	: [ SOURCE_FOLDER+'jade/*.jade',  '!'+SOURCE_FOLDER+'jade/*.base.jade',  '!'+SOURCE_FOLDER+'jade/partials/**)' ],
	images	: SOURCE_FOLDER+'images/**/*',
	fonts	: SOURCE_FOLDER+'fonts/**/*'
};

// Where shall we compile them to?
var destination = {
	scripts : BUILD_FOLDER+'js',
	styles 	: BUILD_FOLDER+'css',
	html 	: BUILD_FOLDER,
	images	: BUILD_FOLDER+'img',
	fonts	: BUILD_FOLDER+'fonts'
};

// Where shall we create the final output?
var distribution = {
	scripts : DISTRIBUTION_FOLDER+'js',
	styles 	: DISTRIBUTION_FOLDER+'css',
	html 	: DISTRIBUTION_FOLDER,
	images	: DISTRIBUTION_FOLDER+'img',
	fonts	: DISTRIBUTION_FOLDER+'fonts'
};

// Where shall we create the final output?
var release = {
	scripts : RELEASE_FOLDER+'js',
	styles 	: RELEASE_FOLDER+'css',
	html 	: RELEASE_FOLDER,
	images	: RELEASE_FOLDER+'img',
	fonts	: RELEASE_FOLDER+'fonts'
};

// How much to squish images
var imageCrunchOptions = {
	optimizationLevel: 3,
	progressive: false
};

// How much to squish HTML
var htmlSquishOptions = {
	removeComments     : true,
	collapseWhitespace : true,
	minifyCSS          : true,
	keepClosingSlash   : true
};

// =======================---------------- IMPORT DEPENDENCIES --------------------

// Requirements for this build to work :
var gulp = require('gulp');						// main Gulp
var concat = require('gulp-concat');			// combine files

// JS Plugins (see inside tasks)

// Image Plugins
var imagemin = require('gulp-imagemin');		// squish images

// CSS Plugins
var less = require('gulp-less');				// compile less files to css
var prefixer = require('gulp-autoprefixer');    // add missing browser prefixes

// HTML Plugins
var jade = require('gulp-jade');				// convert jade to html

var del = require('del');						// delete things and folders
var sequencer = require('run-sequence');		// run synchronously
var es = require('event-stream');				// combine streams

var newer = require('gulp-newer');				// deal with only modified files

var livereload = require('gulp-livereload');	// live reload
var sourcemaps = require('gulp-sourcemaps');    // create source maps for debugging!
var packageJson = require("./package.json");	// read in package.json!

var replace = require('gulp-replace');			// replace content within files
var fs = require('fs');							// read inside files
var rename = require('gulp-rename');			// rename files
var merge = require('merge-stream');			// combine multiple streams!
var filesize = require('gulp-filesize');  		// measure the size of the project (useful if a limit is set!)

// Options read in from package.json
var types = packageJson.types || defaultTypes;	// mpu / skyscraper / leaderboard etc
var variants = packageJson.variants || [];
var varietiesToPackage = variants;				// extensions for varieties such as A, B, C etc.

var config;			// load in an external config file
// config.sizes
// config.sizes.leaderboard.w
// config.sizes.leaderboard.h

// =======================---------------- TASK DEFINITIONS --------------------

///////////////////////////////////////////////////////////////////////////////////
//
// TASK 	: Load in our external settings and overwrite our objects
// ACTION 	: Deletes all files and folders specified in the arguments
//
///////////////////////////////////////////////////////////////////////////////////

gulp.task('configuration', function(cb) {

	return gulp.src( 'config.json' )
		.pipe( replace( /(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm , '' ) )
		.pipe( rename( '.config.json' ) )
		.pipe( gulp.dest( '' ) );
});

gulp.task('load-config', function(cb) {
	config = require('./.config.json');		// load in an external config file
	console.log( config.sizes.mpu );
	cb();
});

// The task to create the debuggable versions
gulp.task('configure', function(callback) {
	sequencer(
		'configuration',
		'load-config',
    callback);
});
gulp.task('conf' , [ 'configure' ] );


///////////////////////////////////////////////////////////////////////////////////
//
// TASK 	: Clean
// ACTION 	: Deletes all files and folders specified in the arguments
//
///////////////////////////////////////////////////////////////////////////////////
gulp.task('clean', function(cb) {
	// You can use multiple globbing patterns as you would with `gulp.src`
	del([BUILD_FOLDER,DISTRIBUTION_FOLDER,RELEASE_FOLDER], cb);
});


// Jade ===========================================================================
///////////////////////////////////////////////////////////////////////////////////
//
// TASK 	: Jade
// ACTION 	: Compiles Jade files into HTML files in their relevant folders
//
///////////////////////////////////////////////////////////////////////////////////
gulp.task('jade-create', function() {
	// Create our source files based on the variations tag in package.json
	// 1. determine filename of the new template file using varietiesToPackage
	// 2. copy the example but swap out the top line with one of
	// mpu.base.jade / leaderboard.base.jade / skyscraper.base.jade
	var folder = SOURCE_FOLDER+'jade/';
	var source = folder+'partials/template.jade';
	var merged = merge();
	var varientsLength = varietiesToPackage.length;
	for (var t = 0, e=types.length; t < e; t++)
	{
		var type = types[t];
		console.log((t+1)+'/'+types.length+'. Creating '+varientsLength+' templates for '+type);

		for (var i = 0, l=varientsLength; i < l; i++)
		{
			var model = varietiesToPackage[i];
			var filename = type+'.'+packageJson.name+'.'+model+'.jade';
			var destination = folder;
			var jade = gulp.src( [source] )
				.pipe( replace(/#{title}/, packageJson.name) )
				.pipe( replace(/#{version}/, packageJson.version) )
				.pipe( replace(/base.jade/, type+'.base.jade') )
				.pipe( rename( filename ) )
				.pipe( gulp.dest( folder ) );

			console.log('\t'+(1+i)+'/'+varietiesToPackage.length+'. Creating '+type+' Template as '+destination+filename );
			merged.add( jade );
		}
	}
	return merged;
});

gulp.task('jade', function() {
	return 	gulp.src( source.jade )
			// neatly formatted code
			.pipe( jade( { pretty:true, debug:false, compileDebug:false } ) )
			.pipe( gulp.dest( destination.html ) );
});

gulp.task('jade-release', function() {
	return 	gulp.src( source.jade )
			// ugly code but smaller
			.pipe( jade( { pretty:false, debug:false, compileDebug:false } ) )
			.pipe( gulp.dest( distribution.html ) );
});

// Image Tasks ====================================================================
///////////////////////////////////////////////////////////////////////////////////
//
// TASK 	: Images
// ACTION 	: Compress images and copy to destinations
//
///////////////////////////////////////////////////////////////////////////////////

// Copy all static images
gulp.task('images', function() {
	return 	gulp.src( source.images)
			.pipe( newer(destination.images) )
			.pipe( gulp.dest( destination.images ) );
});

// Copy all static images & squish
gulp.task('images-release', function() {
	return 	gulp.src( source.images)
			.pipe( newer(distribution.images) )
			.pipe( imagemin( imageCrunchOptions ) )
			.pipe( gulp.dest( distribution.images ) );
});


// Cascading Style Sheets =========================================================
///////////////////////////////////////////////////////////////////////////////////
//
// TASK 	: Less
// ACTION 	: Compiles a single Less files specified into a single CSS file
//
///////////////////////////////////////////////////////////////////////////////////
gulp.task('less', function() {
	return 	gulp.src( source.styles )
			.pipe( newer( destination.styles ) )
			.pipe( less( {strictMath: false, compress: false }) )
			.pipe( prefixer() )
            .pipe( gulp.dest( destination.styles ) );
});

gulp.task('less-release', function() {
	return 	gulp.src( source.styles )
			.pipe( newer( distribution.styles ) )
			.pipe( less( {strictMath: false, compress: true }) )
			.pipe( prefixer() )
            .pipe( gulp.dest( distribution.styles ) );
});


// Copy Files =====================================================================
///////////////////////////////////////////////////////////////////////////////////
//
// TASK 	: Copy
// ACTION 	: Makes duplicates of specified files in the destination folders
//
///////////////////////////////////////////////////////////////////////////////////
gulp.task('copy',function(){
	return gulp.src( source.fonts )
	.pipe( newer( distribution.fonts ) )
	.pipe( gulp.dest( destination.fonts ));
});

gulp.task('copy-release',function(){
	return gulp.src( source.fonts )
	.pipe( newer( distribution.fonts ) )
	.pipe( gulp.dest( distribution.fonts ));
});

gulp.task('copy-manifest',function(){
	return gulp.src( 'src/scripts/manifest.js' )
	// TODO : replace the sizes according to nomenclature
	.pipe( replace(/"width":300/, '"width":300' ) )
	.pipe( replace(/"height":250/, '"height":250' ) )
	.pipe( gulp.dest( distribution.html ));
});


// Scripts ========================================================================
///////////////////////////////////////////////////////////////////////////////////
//
// TASK 	: Scripts
// ACTION 	: Compress and concantenate our Javascript files into one file
//
///////////////////////////////////////////////////////////////////////////////////

// Do stuff with our javascripts for DEBUGGING
gulp.task('scripts', function() {
    // Minify and copy all JavaScript (except vendor scripts)
    // with sourcemaps all the way down
    return  gulp.src( source.scripts )
            .pipe( sourcemaps.init() )
            // combine multiple files into one!
            .pipe( concat('main.min.js') )
            // create source maps
            .pipe( sourcemaps.write() )
            .pipe( gulp.dest( destination.scripts ) );
});

// Do stuff with our javascripts for RELEASE
gulp.task('scripts-release', function() {
    // Minify and copy all JavaScript (except vendor scripts)
    // with sourcemaps all the way down
    var uglify = require('gulp-uglify');            // squash files
	return  gulp.src( source.scripts )
            .pipe( concat('main.min.js') )
            .pipe( uglify() )
            .pipe( gulp.dest( distribution.scripts ) );
});

// Package ========================================================================
///////////////////////////////////////////////////////////////////////////////////
//
// TASK 	: Package
// ACTION 	:
//
// This task simply takes the relevent files from the dist folder,
// creates a new folder in dist and then copies only the relevant files...
// Create dist/folder
// Copy mpu.o2.A.html and rename as index.html
// Copy images/character.a.png
// Copy images/
// Copy fonts/
//
///////////////////////////////////////////////////////////////////////////////////
gulp.task('package',function(){

	var pattern = [ distribution.images +'/*.*' ];
	var merged = merge();

	for (var p = 0, l=varietiesToPackage.length; p < l; p++)
    {
		pattern.push( '!'+ distribution.images +'/*.'+ varietiesToPackage[p] +'.*' );
    }
	for (var t = 0, e=types.length; t < e; t++)
	{
		var type = types[t];
		// loop through varieties
		for (var i = 0, l=varietiesToPackage.length; i < l; i++)
		{
			var model = varietiesToPackage[i];
			var html = distribution.html + '*.'+model+'.html';
			var folder = release.html + type + '.'+model + '/';
			var output = 'index.html';
			var size = sizes[ type ];

			// create release folder
			var htmlStream = gulp.src( html )
			.pipe(rename( output ))
			.pipe(gulp.dest( folder ));

			// all except specific images
			var imageStream = gulp.src( pattern )
			.pipe(gulp.dest( folder + 'img' ));

			// target specific
			var variantStream = gulp.src( distribution.images +'/*.'+model+'.*' )
			.pipe(gulp.dest( folder + 'img' ));

			// fonts
			var fontStream = gulp.src( distribution.fonts +'/*.*' )
			.pipe(gulp.dest( folder + 'fonts' ));

			// css
			var styleStream = gulp.src( distribution.styles +'/*.css' )
			.pipe(gulp.dest( folder + 'css' ));

			// js
			var scriptStream = gulp.src( distribution.scripts +'/*.js' )
			.pipe(gulp.dest( folder + 'js' ));

			// manifest
			var manifestStream = gulp.src( distribution.html+'manifest.js' )
			.pipe( replace(/"width":300/, '"width":'+size.w ) )
			.pipe( replace(/"height":250/, '"height":'+size.h ) )
			.pipe(gulp.dest( folder ));

			// add to merge
			merged.add( htmlStream );
			merged.add( imageStream );
			merged.add( variantStream );
			merged.add( fontStream );
			merged.add( styleStream );
			merged.add( scriptStream );
			merged.add( manifestStream );


			// create package folders in dist folder
			console.log(t+ '. Packaging "'+type+'.'+model+'" from '+html +' to '+folder );
		}
	}
	// the base option sets the relative root for the set of files,
	// preserving the folder structure, { base: './' }
	return merged;
});
///////////////////////////////////////////////////////////////////////////////////
//
// TASK 	: Zip
// ACTION 	: Create a Zip file for each Release
//
///////////////////////////////////////////////////////////////////////////////////
gulp.task('zip', function (cb) {

	var zip = require('gulp-zip');					// zip files
	// var date = new Date().toISOString().replace(/[^0-9]/g, '');
	var merged = merge();
	var type = types[0];
    for (var i = 0, l=varietiesToPackage.length; i < l; i++)
    {
    	var model = varietiesToPackage[i];
		var folder = release.html + type + '.'+model + '/';
   		var fileName = packageJson.name+'-'+type +'-'+model+"-" + packageJson.version + ".zip";

		console.log(i + '. Zipping "'+fileName +'" from ' +folder);

       	// keep directory structure
        var zipStream =  gulp.src( folder + '**/*' )
        .pipe( zip(fileName) )
		// console.log the filezie! :P
        .pipe( filesize() )
        .pipe( gulp.dest( RELEASE_FOLDER ) );

		merged.add( zipStream );
    };

	return merged;
});


// Utilities =====================================================
///////////////////////////////////////////////////////////////////////////////////
//
// TASK : Watch
//
// Rerun the task when a file changes
//
///////////////////////////////////////////////////////////////////////////////////
gulp.task('watch', function() {

	// Create LiveReload server
	livereload.listen();

	// Watch any files in dist/, reload on change
	gulp.watch(['dist/**']).on('change', livereload.changed);
});















///////////////////////////////////////////////////////////////////////////////////
// COMPOSITE TASKS =====================================================
///////////////////////////////////////////////////////////////////////////////////

// compile all assets & create sourcemaps
gulp.task('rebuild', 	[ 'less', 'jade', 'images', 'scripts', 'copy' ] );

// squish everything & concatanate scripts
gulp.task('deploy', 	[ 'less-release', 'jade-release', 'images-release', 'scripts-release', 'copy-release','copy-manifest' ] );

// create a server to host this project
gulp.task('serve', 		['rebuild', 'watch'] );

// Create the template jade files
// The task to create the debuggable versions
gulp.task('create', function(callback) {
	sequencer(
		'configure',
		'jade-create',
    callback);
});

gulp.task('template', 	[ 'create' ] );
gulp.task('templates', 	[ 'create' ] );
gulp.task('t', 			[ 'create' ] );
gulp.task('scaffold', 	[ 'create' ] );


// The task to create the debuggable versions
gulp.task('build', function(callback) {
	sequencer(
		'configure',
		'clean',
		'rebuild',
    callback);
});


// The task to create the minified versions
gulp.task('compile', function(callback) {
	sequencer(
		'configure',
		'clean',
		'deploy',
		'package',
    callback);
});
// Shortcuts for compile
gulp.task('comp' , 	[ 'compile' ] );
gulp.task('c' , 	[ 'compile' ] );


// The task to create the final output!
// As many of these tasks are not asynch
gulp.task('distribute', function(callback) {
	sequencer(
		'configure',
		'clean',
		'deploy',
		'package',
		'zip',
    callback);
});
// Shortcuts for distribute
gulp.task('dist' , 	[ 'distribute' ] );
gulp.task('d' , 	[ 'distribute' ] );

///////////////////////////////////////////////////////////////////////////////////
// The default task (called when you run 'gulp' from cli)
gulp.task('default', function(callback) {

	console.log( 'Help (you can return here by typing "gulp" or "gulp help")');
	console.log( "--Config---------------------------------");
	console.log( 'Campaign 		: "'+packageJson.name+'" in '+varietiesToPackage.length +' variants' );
	console.log( 'Types 		: "'+packageJson.types +'"' );
	console.log( 'Version 		: "'+packageJson.version+'" ' );
	console.log( 'Description 	: "'+packageJson.description+'" ' );
	console.log( 'Settings Location : "package.json" ' );

	console.log( varietiesToPackage.length + ' Campaign(s) Found : "'+varietiesToPackage+'" ' );
	console.log( "--Tasks----------------------------------");


    callback();
});
gulp.task('help' , [ 'default' ] );
