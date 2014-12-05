/*

This handles the compilation of the source elements :

Less 			-> 		CSS 3
Jade 			-> 		HTML 5
JavaScript		-> 		JS ( Squished, uglified, concatanated )

For help with Globbing Patterns (the defaults should be fine!) check out :
http://gruntjs.com/configuring-tasks#globbing-patterns

*/

// =======================---------------- CONFIGURATION --------------------

// Maximum file sizes for stuff...
var MAX_SIZE_JPEG = 30;

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


// SOURCE_FOLDER+'scripts/vendor/**/*.js',
// Where do our source files live?
var source = {
	// ensure that all scripts in the JS folder are compiled, but that animation is the *last* one
	scripts : [ SOURCE_FOLDER+'scripts/vendor/*.js', SOURCE_FOLDER+'scripts/!(*manifest|animation)*.js', SOURCE_FOLDER+'scripts/animation.js' ],
	styles 	: SOURCE_FOLDER+'less/style.less',
	jade 	: [ SOURCE_FOLDER+'jade/*.jade',  '!'+SOURCE_FOLDER+'jade/*.base.jade',  '!'+SOURCE_FOLDER+'jade/partials/**)' ],
	images	: SOURCE_FOLDER+'images/**/*.+(png|jpg|jpeg|gif|webp|svg)',
	fonts	: SOURCE_FOLDER+'fonts/**/*.+(svg|eot|woff|ttf|otf)'
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

// Files and folders to watch for changes in...
var watch = {
	scripts : SOURCE_FOLDER+'scripts/*.js',
	styles 	: SOURCE_FOLDER+'less/*.less',
	jade 	: SOURCE_FOLDER+'jade/*.jade',
	images	: SOURCE_FOLDER+'images/**/*',
	fonts	: SOURCE_FOLDER+'fonts/**/*'
};


// =======================---------------- IMPORT DEPENDENCIES --------------------

// Requirements for this build to work :
var gulp = require('gulp');						// main Gulp
var concat = require('gulp-concat');			// combine files
var packageJson = require("./package.json");	// read in package.json!

// JS Plugins (see inside tasks)

// Image Plugins
var imagemin = require('gulp-imagemin');		// squish images
var pngquant = require('imagemin-pngquant');	// png squisher
var jpegoptim = require('imagemin-jpegoptim');	// jpg squisher ( with file size imiter :) )

// CSS Plugins
var less = require('gulp-less');				// compile less files to css
var prefixer = require('gulp-autoprefixer');    // add missing browser prefixes
var uncss = require('gulp-uncss');				// remove unused css

// HTML Plugins
var jade = require('gulp-jade');				// convert jade to html

var del = require('del');						// delete things and folders
var sequencer = require('run-sequence');		// run synchronously
var es = require('event-stream');				// combine streams

var newer = require('gulp-newer');				// deal with only modified files

var livereload = require('gulp-livereload');	// live reload
var sourcemaps = require('gulp-sourcemaps');    // create source maps for debugging!

var replace = require('gulp-replace');			// replace content within files
var fs = require('fs');							// read inside files
var rename = require('gulp-rename');			// rename files
var merge = require('merge-stream');			// combine multiple streams!
var filesize = require('gulp-filesize');  		// measure the size of the project (useful if a limit is set!)
var expect = require('gulp-expect-file');		// expect a certain file (more for debugging)

var connect = require('gulp-connect');			// live reload capable server for files

var types = defaultTypes;						// mpu / skyscraper / leaderboard etc
var variants = [];								// campaign variants such as "a","b","c","d" or "1","2","3","4"
var varietiesToPackage = variants;				// extensions for varieties such as A, B, C etc.
var config;										// loaded in from an external config file

// How much to squish images by :
/* 
The optimization level 0 enables a set of optimization operations that require minimal effort. There will be no changes to image attributes like bit depth or color type, and no recompression of existing IDAT datastreams. The optimization level 1 enables a single IDAT compression trial. The trial chosen is what. OptiPNG thinks it’s probably the most effective. The optimization levels 2 and higher enable multiple IDAT compression trials; the higher the level, the more trials.

Level and trials:

    1 trial
    8 trials
    16 trials
    24 trials
    48 trials
    120 trials
    240 trials,
	// Additional plugins to use with imagemin.{ size:MAX_SIZE_JPEG }
	use: [jpegoptim()]
*/
var imageCrunchOptions = {
	// Select an optimization level between 0 and 7
	optimizationLevel: 3,
	// Lossless conversion to progressive
	progressive: false,
	// Interlace gif for progressive rendering.
	interlaced : false
};

// How much to squish HTML
var htmlSquishOptions = {
	removeComments     : true,
	collapseWhitespace : true,
	minifyCSS          : true,
	keepClosingSlash   : true
};

// =======================---------------- TASK DEFINITIONS --------------------

///////////////////////////////////////////////////////////////////////////////////
//
// TASK 	: Load in our external settings and overwrite our objects
// ACTION 	: Deletes all files and folders specified in the arguments
//
///////////////////////////////////////////////////////////////////////////////////
var settings = 'config.json';
var renamed = '.config.json';

gulp.task('configuration-save', function(cb) {
	return gulp.src( settings )
		.pipe( expect( settings ) )
		.on( 'error', function (err) { console.error(err); } )
		.pipe( replace( /(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm , '' ) )
		.pipe( rename( renamed ) )
		.pipe( gulp.dest( '' ) );
});

gulp.task('configuration-load', function(cb) {
	config = require('./'+renamed);		// load in the external config file
	//config = fs.readFile('./'+renamed, 'utf-8', func);
	
	expect( renamed );
	
	types = config.types;
	varietiesToPackage = config.variants;
	
	console.log( 'Loading : '+settings + ' for Brand : '+config.brand +' version '+config.version );
	console.log( 'Variants : '+config.variants );
	console.log( 'Types : '+config.types );
	
	cb();
});

gulp.task('configuration', function(callback) {
	sequencer(
		'configuration-save',
		'configuration-load',
    callback);
});

// The task to load in our settings file
gulp.task('conf' , [ 'configuration' ] );
gulp.task('configure' , [ 'configuration' ] );

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

// Template ===========================================================================
///////////////////////////////////////////////////////////////////////////////////
//
// TASK 	: Templates
// ACTION 	: Cretes template JADE files and javascript MANIFEST files
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
		var size = config.sizes[ type ];
		
		console.log((t+1)+'/'+types.length+'. Creating '+varientsLength+' templates for '+type);

		for (var i = 0, l=varientsLength; i < l; i++)
		{
			var model = varietiesToPackage[i];
			var filename = (type+'.'+config.brand+'.'+model+'.jade').toLowerCase();
			var destination = folder;
			var jade = gulp.src( [source] )
				.pipe( replace(/#{title}/gi, config.brand) )
				.pipe( replace(/#{version}/, config.version) )
				.pipe( replace(/#{type}/gi, type.toLowerCase() ) )
				.pipe( replace(/#{width}/gi, size.w) )
				.pipe( replace(/#{height}/gi, size.h) )
				.pipe( replace(/base.jade/, type+'.base.jade') )
				.pipe( rename( filename ) )
				.pipe( gulp.dest( folder ) );

			console.log('\t'+(1+i)+'/'+varietiesToPackage.length+'. Creating '+type+' Template as '+destination+filename );
			merged.add( jade );
		}
	}
	return merged;
});

gulp.task('clone-manifests', function() {
	
	var folder = SOURCE_FOLDER+'scripts/';
	var source = folder+'manifest.js';
	var merged = merge();
	var varientsLength = varietiesToPackage.length;
	for (var t = 0, e=types.length; t < e; t++)
	{
		var type = types[t];
		var size = config.sizes[ type ];
		var filename = type+'.manifest.js';
		var manifest = gulp.src( [source] )
			.pipe( replace(/"width":300/, '"width":'+size.w ) )
			.pipe( replace(/"height":250/, '"height":'+size.h ) )
			.pipe( replace(/#{title}/gi, config.brand) )
			.pipe( replace(/#{version}/gi, config.version) )
			.pipe( replace(/#{type}/gi, type.toLowerCase() ) )
			.pipe( replace(/#{width}/gi, size.w) )
			.pipe( replace(/#{height}/gi, size.h) )
			.pipe( rename( filename ) )
			.pipe( gulp.dest( folder ) );	// <- save back into source!

		console.log('\t'+t+'. Creating '+type+' Template as '+folder+filename );
		merged.add( manifest );
	}
	return merged;
});
// The task to create the debuggable versions
gulp.task('create-manifests', function(callback) {
	sequencer(
		'configure',
		'clone-manifests',
    callback);
});
gulp.task('manifest', 	[ 'create-manifests' ] );


// Jade ===========================================================================
///////////////////////////////////////////////////////////////////////////////////
//
// TASK 	: Jade
// ACTION 	: Compiles Jade files into HTML files in their relevant folders
//
///////////////////////////////////////////////////////////////////////////////////

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
			//.pipe( newer(distribution.images) )
			.pipe( imagemin( imageCrunchOptions ) )
			.pipe( pngquant({optimizationLevel: 3})() )
			//.pipe( jpegoptim({ size:MAX_SIZE_JPEG })() )
			.pipe( gulp.dest( distribution.images ) );
			//.pipe( expect( source.images ) );
});

/*
// Copy all static images & squish
// DOES NOT WORK! results in filesize 0k...
// Be more pragmatic whilst creating your assets!
gulp.task('images-jpegs', function() {
	//return 	gulp.src( SOURCE_FOLDER+'images/jpg/*.+(jpg|jpeg)' )
	var test = [ SOURCE_FOLDER+'images/jpg/bg_mpu*.jpg', SOURCE_FOLDER+'images/jpg/bg_wideskyscraper*.+(jpg|jpeg)' ];
	//var test = [ SOURCE_FOLDER+'images/jpg/bg_halfpage*.jpg', SOURCE_FOLDER+'images/jpg/bg_leaderboard*.+(jpg|jpeg)', distribution.images+'/jpg/bg_mpu*.jpg', distribution.images+'/jpg/bg_wideskyscraper*.+(jpg|jpeg)' ];
	//var test = [ distribution.images+'/jpg/bg_wideskyscraper*.+(jpg|jpeg)' ];
	return 	gulp.src( test )
	//return 	gulp.src( SOURCE_FOLDER+'images/jpg/*.jpg' )
			.pipe( jpegoptim({ size:MAX_SIZE_JPEG })() )
			.pipe( expect( test ) )
			.pipe( gulp.dest( distribution.images+'/jpg' ) );
});

*/

// Cascading Style Sheets =========================================================
///////////////////////////////////////////////////////////////////////////////////
//
// TASK 	: Less
// ACTION 	: Compiles a single Less files specified into a single CSS file
//
//.pipe( newer( destination.styles ) )
//		
///////////////////////////////////////////////////////////////////////////////////
gulp.task('less', function() {
	return 	gulp.src( source.styles )
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
	.pipe( newer( destination.fonts ) )
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
	.pipe( replace(/#{type}/gi, 'mpu' ) )
	.pipe( gulp.dest( destination.html ))
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
// Copy images/
// Copy fonts/
//
///////////////////////////////////////////////////////////////////////////////////
gulp.task('package',function(){

	var merged = merge();
	var p, t, e, l, g, k;

	for (t = 0, e=types.length; t < e; t++)
	{
		var type = types[t];
		var imageGlob = [ distribution.images +'/**/*' ];
			
		// Loop through types and create a glob that finds *all* files that do NOT have a type in their title
		// AS WELL as *all* files that have this SPECIFIC type of 
		for (g = 0, k=types.length; g < k; g++)
		{
			// 
			// we only want to copy files that *HAVE* either a unique file name with no type specified
			// or an image that has the specific type specified...
			
			if ( type === types[g] )
			{
				// Yes we want!
				// imageGlob.push( distribution.images +'/**/*'+ type +'*' );
			}else{
				// No we *dont* want
				imageGlob.push( '!'+ distribution.images +'/**/*'+ (types[g]) +'*' );
				imageGlob.push( '!'+ distribution.images +'/**/*'+ (types[g]).toLowerCase() +'*' );
			}
		}
				
		// loop through varieties
		for (var i = 0, l=varietiesToPackage.length; i < l; i++)
		{
			var model = varietiesToPackage[i];
			//var html = distribution.html + '*.'+model+'.html';
			var title = config.brand+' ' + type;
			var html = distribution.html + (type+'.'+config.brand+'.'+model+'.html').toLowerCase();
			var folder = release.html + type + '.'+model + '/';
			var size = config.sizes[ type ];

			// create release folder
			var htmlStream = gulp.src( html )
			.pipe( rename( 'index.html' ))
			.pipe( replace(/<title>(.*)<\/title>/i, title ) )
			.pipe( gulp.dest( folder ));

			// all except specific images
			var imageStream = gulp.src( imageGlob )
			.pipe( gulp.dest( folder + 'img' ));

			// target specific
			var variantStream = gulp.src( distribution.images +'/*.'+model+'.*' )
			.pipe( gulp.dest( folder + 'img' ));
			
			// fonts
			var fontStream = gulp.src( distribution.fonts +'/*.*' )
			.pipe( gulp.dest( folder + 'fonts' ));

			// js
			var scriptStream = gulp.src( distribution.scripts +'/*.js' )
			.pipe( gulp.dest( folder + 'js' ));

			// manifest
			var 
				files = [],
				manifestFile = 'manifest.js',
				manifestFolder = SOURCE_FOLDER+'scripts/',
				manifest = manifestFolder+type+'.'+manifestFile;

			// This first checks to see if the manifest for this file exists...
			if( fs.existsSync( manifest ) )
			{
				// Use custom Manifest file
				files.push( manifest );
				//console.error('Custom Manifest FOUND! at : '+manifest );
			} else {
				// Use default Manifest file
				files.push( manifestFolder+'manifest.js' );
				console.error('[error] Manifest missing for size '+type+' \n\t Please create the file : '+manifest );
			}
		
			var manifestStream = gulp.src( files )
			// automatically update sizes within
			//.pipe( replace(/"width":300/, '"width":'+size.w ) )
			//.pipe( replace(/"height":250/, '"height":'+size.h ) )
			// and save into the correct distribution folder...
			.pipe( expect( files ) )
			.pipe( rename( manifestFile ) )
			.pipe( gulp.dest( release.html + type + '.'+model ));
			
			// css
			console.log('Attempting to uncss the files linked through '+html);
			var styleStream = gulp.src( distribution.styles +'/*.css' )
			// Remove unused CSS with UnCSS for *this* campaign
			/*
			.pipe( expect(html) )*/
			.pipe( gulp.dest( folder + 'css' ));

			
			// add to merge
			merged.add( htmlStream );
			merged.add( imageStream );
			merged.add( variantStream );
			merged.add( fontStream );
			merged.add( scriptStream );
			merged.add( manifestStream );
			merged.add( styleStream );
			
			// create package folders in dist folder
			console.log(t+ '. Packaging "'+type+'.'+model+'" from '+html +' to '+folder );
		}
	}
	
	// now loop through each new campaign folder and uncss & optimise it!
	for (t = 0, e=types.length; t < e; t++)
	{
		var type = types[t];
		// loop through varieties
		for (var i = 0, l=varietiesToPackage.length; i < l; i++)
		{
			var model = varietiesToPackage[i];
			var folder = release.html + type + '.'+model + '/';
			var styleStream = gulp.src( folder +'css/style.css' )
				// Remove unused CSS with UnCSS for *this* campaign
				.pipe( uncss({
					html: [ folder+'index.html' ]
				}) )
				.pipe( gulp.dest( folder + 'css' ));

			merged.add( styleStream );
		}
	}
	
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

	for (var t = 0, e=types.length; t < e; t++)
	{
		var type = types[t];
		for (var i = 0, l=varietiesToPackage.length; i < l; i++)
		{
			var model = varietiesToPackage[i];
			var folder = release.html + type + '.'+model + '/';
			var fileName = (config.brand +'-'+type +'-'+model+".zip").toLowerCase();
			
			// NB. FlashTalking does *not* allow periods and such... so config.version is a no go
			console.log(i + '. Zipping "'+fileName +'" from ' +folder);

			// keep directory structure
			var zipStream =  gulp.src( folder + '**/*' )
			.pipe( zip(fileName) )
			// console.log the filezie! :P
			.pipe( filesize() )
			.pipe( gulp.dest( RELEASE_FOLDER ) );

			merged.add( zipStream );
		}
	};

	return merged;
});


// Utilities ======================================================================

///////////////////////////////////////////////////////////////////////////////////
//
// TASK : Watch BUILD
//
// Rerun the task when a file changes
//
///////////////////////////////////////////////////////////////////////////////////
gulp.task('watch', function() {

	// Watch any files in build/, reload on change
	gulp.watch( [ watch.scripts ] 	, 'scripts' );
	gulp.watch( [ watch.styles ] 	, 'less' );
	gulp.watch( [ watch.jade ] 		, 'jade' );
	gulp.watch( [ watch.images ] 	, 'images' );
	gulp.watch( [ watch.fonts ] 	, 'copy' );
	
	//gulp.watch( [ BUILD_FOLDER+'**/*' ] , 'refresh' ).on('change', function (file) {
	gulp.watch( [ BUILD_FOLDER+'**/*' ] ).on('change', function (file) {
    	gulp.src( file.path ).pipe( connect.reload() );
	});
});




// Server =========================================================================

///////////////////////////////////////////////////////////////////////////////////
//
// TASK : Serve
//
// Start a webserver and display the index
//
///////////////////////////////////////////////////////////////////////////////////
gulp.task('refresh', function() {
	return gulp.src( BUILD_FOLDER+'*.html' )
		.pipe(connect.reload());
});

gulp.task('server', function() {
  	connect.server({
		root: 'build',
		port:8080,
		livereload: true
  	});
});














///////////////////////////////////////////////////////////////////////////////////
// COMPOSITE TASKS =====================================================
///////////////////////////////////////////////////////////////////////////////////

// compile all assets & create sourcemaps
gulp.task('rebuild', 	[ 'less', 'jade', 'images', 'scripts', 'copy', 'copy-manifest' ] );

// squish everything & concatanate scripts
gulp.task('deploy', 	[ 'less-release', 'jade-release', 'images-release', 'scripts-release', 'copy-release' ] );

// create a server to host this project
gulp.task('serve', 		['rebuild', 'server', 'watch'] );

// Create the template jade files
// The task to create the debuggable versions
gulp.task('create', function(callback) {
	sequencer(
		'configure',
		'jade-create',
		'clone-manifests',
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
		'compile',
		'zip',
    callback);
});
// Shortcuts for distribute
gulp.task('dist' , 	[ 'distribute' ] );
gulp.task('d' , 	[ 'distribute' ] );

///////////////////////////////////////////////////////////////////////////////////
// The default task (called when you run 'gulp' from cli)
///////////////////////////////////////////////////////////////////////////////////
gulp.task('default', function(callback) {
	sequencer(
		// load configuration
		'configure',
		// show help file
		'help',
    callback);
});

gulp.task('help' , function(callback) {

	console.log( "-- Config ---------------------------------");
	console.log( 'Campaign\t: "'+config.brand+'" in '+varietiesToPackage.length +' variants' );
	console.log( 'Types\t: "'+config.types +'"' );
	console.log( 'Version\t: "'+config.version+'" ' );
	console.log( 'Description\t: "'+config.description+'" ' );
	console.log( 'Settings Location\t: "config.json" ' );

	console.log( varietiesToPackage.length + ' Campaign(s) Found : "'+varietiesToPackage+'" ' );
	console.log( "-- Tasks ----------------------------------");
	
	console.log( '');
	console.log( 'NB. Help (you can return here by typing "gulp" or "gulp help")');
	
    callback();
} );
