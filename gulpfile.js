/*

This handles the compilation of the source elements :

Less 			-> 		CSS 3
Jade 			-> 		HTML 5
JavaScript		-> 		JS ( Squished, uglified, concatanated )

For help with Globbing Patterns (the defaults should be fine!) check out :
http://gruntjs.com/configuring-tasks#globbing-patterns

*/

// =======================---------------- CONFIGURATION --------------------

// choice of tween engines either TweenMax or TweenLite
var tweenEngine = 'tweenlite'.toLowerCase();


var squish                  = false;

// Set up paths here (for this boilerplate, you should not have to alter these)
var SOURCE_FOLDER 			= 'src/';									// Source files Root
var BUILD_FOLDER 			= 'build/';									// Where the initial build occurs (debugable)
var DISTRIBUTION_FOLDER 	= 'dist/';									// Once debugging is complete, copy to server ready files here
var RELEASE_FOLDER 			= squish ? 'release/' : 'uncompressed/';	// Convert to distributable zips

// Default variations for templating
var defaultTypes =
[
  "mpu",
  "leaderboard",
  "skyscraper"
];

// Files and folders to watch for changes in...
var watch = {
	scripts : SOURCE_FOLDER+'scripts/*.js',
	styles 	: SOURCE_FOLDER+'less/*.less',
	jade 	: SOURCE_FOLDER+'jade/*.jade',
	images	: SOURCE_FOLDER+'images/**/*',
	fonts	: SOURCE_FOLDER+'fonts/**/*'
};

// Where do our source files live?
var source = {
	// ensure that all scripts in the JS folder are compiled, but that flashtrack is the *last* one
	scripts : [ 
		SOURCE_FOLDER+'scripts/vendor/'+tweenEngine+'/**/*.js', 
		SOURCE_FOLDER+'scripts/vendor/trmix*.js', 
		SOURCE_FOLDER+'scripts/vendor/fontscaler.js', 
		SOURCE_FOLDER+'scripts/!(*manifest|flashtrack)*.js', 
		SOURCE_FOLDER+'scripts/flashtrack.js' 
	],
	styles 	: SOURCE_FOLDER+'less/style.less',
	jade 	: [ 
		SOURCE_FOLDER+'jade/*.jade', 
		'!'+SOURCE_FOLDER+'jade/*.base.jade',  
		'!'+SOURCE_FOLDER+'jade/partials/**)' 
	],
	images	: SOURCE_FOLDER+'images/**/*.+(png|jpg|jpeg|gif|webp|svg)',
	fonts	: SOURCE_FOLDER+'fonts/**/*.+(svg|eot|woff|woff2|ttf|otf)'
};

// Where shall we compile them to?
var structure = {
	scripts : 'js',
	styles 	: 'css',
	html 	: '',
	images	: 'img',
	fonts	: 'fonts'
};

// Where shall we compile them to?
var getDestinations = function( dir ) {
	return {
		scripts : dir + structure.scripts,
		styles 	: dir + structure.styles,
		html 	: dir + structure.html,
		images	: dir + structure.images,
		fonts	: dir + structure.fonts
	};
};


// Where shall we compile them to?
var 
    destination = getDestinations( BUILD_FOLDER ),          // Where shall we create the building / debug versions
    distribution = getDestinations( DISTRIBUTION_FOLDER ),  // Where shall we create the final output
    release = getDestinations( RELEASE_FOLDER );            // Where shall we create the zips?



// Flip flop between dirs...
var workingDir = destination;
//var workingDir = distribution;
//var workingDir = release;



///////////////////////////////////////////////////////////////////////////////////
// File name format for creating distributions
// You can set this to however your campaign needs
// Defaults to brand-type-variant.zip
// Fetch and create a nice filename that excludes punctuation
// and spaces are a no-go too...
///////////////////////////////////////////////////////////////////////////////////
var getFileName = function( brand, type, variant, suffix, extras ){
	// optional
	extras = extras || "";
	var name = extras + brand +'-'+type +'-'+variant;
	// remove spaces and replace with underscores
	name = name.replace(/ +?/g, '_');
	// swap out full stops for hyphens (mainly for versioning)
	name = name.replace(/\./g, "-");
	// remove not allowed characters...
	name = name.replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#\$%&\(\)\*\+,\/:;<=>\?@\[\]\^_`\{\|\}~]/g, "_");
	// make sure we have a suffix if needed
	if (suffix) name += suffix;
	return name.toLowerCase();
};

///////////////////////////////////////////////////////////////////////////////////
// File name format for creating templates
///////////////////////////////////////////////////////////////////////////////////
var sanitisedFileName = function( brand, type, variant, suffix ){
	var name = type + '.'+ brand +'.'+variant;
	// remove spaces
	name = name.replace(/ +?/g, '_');
	// remove not allowed characters...
	// make sure we have a suffix if needed
	if (suffix) name += suffix;
	return name.toLowerCase();
};

///////////////////////////////////////////////////////////////////////////////////
// monitor output from watched files and their changes
///////////////////////////////////////////////////////////////////////////////////
var changeEvent = function(evt) {
    console.log('File', evt.path.replace(new RegExp('/.*(?=/' + basePaths.src + ')/'), ''), 'was', evt.type );
};

// =======================---------------- IMPORT DEPENDENCIES --------------------

// Requirements for this build to work :
var gulp = require('gulp');
var concat = require('gulp-concat');			// combine files
var packageJson = require("./package.json");	// read in package.json!

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
var gulpif = require('gulp-if');				// conditional compiles

var newer = require('gulp-newer');				// deal with only modified files

var livereload = require('gulp-livereload');	// live reload
var sourcemaps = require('gulp-sourcemaps');    // create source maps for debugging!

var replace = require('gulp-replace');			// replace content within files
var fs = require('fs');							// read inside files
var rename = require('gulp-rename');			// rename files
var merge = require('merge-stream');			// combine multiple streams!
var filesize = require('gulp-size');  			// measure the size of the project (useful if a limit is set!)
var expect = require('gulp-expect-file');		// expect a certain file (more for debugging)

var connect = require('gulp-connect');			// live reload capable server for files
var console = require('better-console');		// sexy console output


var types = defaultTypes;						// mpu / skyscraper / leaderboard etc
var variants = [];								// campaign variants such as "a","b","c","d" or "1","2","3","4"
var varietiesToPackage = variants;				// extensions for varieties such as A, B, C etc.

var settings = 'config.json';
var renamed = '.config.json';

var config;										// loaded in from an external config file


// ===== ERROR CHECKING --------------------------------------------------------
if ( !fs.existsSync( settings ) ) console.error( "No Config Found" );



// =======================---------------- TASK DEFINITIONS --------------------

///////////////////////////////////////////////////////////////////////////////////
//
// TASK 	: Load in our external settings and overwrite our objects
// ACTION 	: Deletes all files and folders specified in the arguments
//
///////////////////////////////////////////////////////////////////////////////////

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
	
	console.info( 'Loading : '+settings + ' for Brand : '+config.brand +' version '+config.version );
	console.table( 'Variants : ', config.variants );
	console.table( 'Types : ',  config.types );
	
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

//require('./tasks/configurate.js')(gulp);


///////////////////////////////////////////////////////////////////////////////////
//
// TASK 	: Clean
// ACTION 	: Deletes all files and folders specified in the arguments
//
///////////////////////////////////////////////////////////////////////////////////
gulp.task('clean', function(cb) {
	// You can use multiple globbing patterns as you would with `gulp.src`
	del([BUILD_FOLDER,DISTRIBUTION_FOLDER,RELEASE_FOLDER], cb);//.on('error', function() { console.error('Could not delete the folder :('); });
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
			var fileName = sanitisedFileName( config.brand, type, model, ".jade" );
			var destination = folder;
			var jade = gulp.src( [source] )
				.pipe( replace(/#{title}/gi, config.brand) )
				.pipe( replace(/#{version}/, config.version) )
				.pipe( replace(/#{type}/gi, type.toLowerCase() ) )
				.pipe( replace(/#{variant}/gi, model) )
				.pipe( replace(/#{width}/gi, size.w) )
				.pipe( replace(/#{height}/gi, size.h) )
				.pipe( replace(/base.jade/, type+'.base.jade') )
				.pipe( rename( fileName ) )
				.pipe( gulp.dest( folder ) );

			console.log('\t'+(1+i)+'/'+varietiesToPackage.length+'. Creating '+type+' Template as '+destination+fileName );
			merged.add( jade );
		}
	}
	return merged;
});

// The task to create the debuggable versions
gulp.task('templates', function(callback) {
	sequencer(
		'configure',
		'clone-manifests',
    callback);
});
gulp.task('manifest', 	[ 'create-manifests' ] );


// Create Manifest files for each SIZE
gulp.task('clone-manifests', function() {
	// check config file...
	var folder = SOURCE_FOLDER+'scripts/';
	var source = folder+'manifest.js';
	var merged = merge();
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
			.pipe( replace(/#{variant}/gi, type) )
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

// Create Manidest files for each VARIANT
gulp.task('clone-manifest-variants', function() {
	// check config file...
	var folder = SOURCE_FOLDER+'scripts/';
	var source = folder+'manifest.js';
	var merged = merge();
	var varientsLength = varietiesToPackage.length;

    // Loop through TYPES
    for (var t = 0, e=types.length; t < e; ++t)
    {
        var type = types[t];
        var size = config.sizes[ type ];

        // Loop through VARIANTS
        for (var v=0; v < varientsLength; ++v)
        {
            var variant = varietiesToPackage[ v ];
            var filename = type+'.manifest.'+variant+'.js';
            var manifest = gulp.src( [source] )
                .pipe( replace(/"width":300/, '"width":'+size.w ) )
                .pipe( replace(/"height":250/, '"height":'+size.h ) )
                .pipe( replace(/#{title}/gi, config.brand) )
                .pipe( replace(/#{version}/gi, config.version) )
                .pipe( replace(/#{variant}/gi, type) )
                .pipe( replace(/#{type}/gi, type.toLowerCase() ) )
                .pipe( replace(/#{width}/gi, size.w) )
                .pipe( replace(/#{height}/gi, size.h) )
                .pipe( rename( filename ) )
                .pipe( gulp.dest( folder ) );	// <- save back into source!

            console.log('\t'+t+'. Creating '+type+' Template as '+folder+filename );
            merged.add( manifest );
        }
    }
    
	return merged;
});

// The task to create the debuggable versions
gulp.task('create-manifests-variants', function(callback) {
	sequencer(
		'configure',
		'clone-manifest-variants',
    callback);
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


// here we use the config file to determine how to output the html
gulp.task('jade-release', function() {
	var htmlmin = require('gulp-htmlmin');			// squish html
	return 	gulp.src( source.jade )
			.pipe( jade( { pretty:!squish, debug:false, compileDebug:false } ) )
			.pipe( gulpif( squish, htmlmin( config.htmlSquishOptions )) )	                // ugly code but smaller
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
			.pipe( imagemin( config.imageCrunchOptions ) )
			//.pipe( pngquant({optimizationLevel: 3})() )
			//.pipe( jpegoptim({ size:MAX_SIZE_JPEG })() )
			.pipe( gulp.dest( distribution.images ) );
});


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
			.pipe( gulpif( squish, less( {strictMath: false, compress: true }), less( {strictMath: false, compress: false }) ))	// ugly code but smaller
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
gulp.task('scripts-lint', function() {
    // Minify and copy all JavaScript (except vendor scripts)
    // with sourcemaps all the way down
	var jshint = require('gulp-jshint');			// lint!
	return  gulp.src([ SOURCE_FOLDER+'scripts/*.js' ] )
            //.pipe( uglify() )
			.pipe( jshint('.jshintrc'))
			.pipe( jshint.reporter('default') );
});

// Do stuff with our javascripts for DEBUGGING
gulp.task('scripts', function() {
    // Minify and copy all JavaScript (except vendor scripts)
    // with sourcemaps all the way down
   var uglify = require('gulp-uglify');            // squash files
	 var jshint = require('gulp-jshint');			// lint!
	return  gulp.src( source.scripts )
            .pipe( sourcemaps.init() )
            // combine multiple files into one!
            .pipe( concat('main.min.js') )
			.pipe( jshint('.jshintrc'))
			.pipe( jshint.reporter('default') )
			// create source maps
            .pipe( sourcemaps.write() )
            .pipe( gulp.dest( destination.scripts ) );
});

// Do stuff with our javascripts for RELEASE
gulp.task('scripts-release', function() {
    // Minify and copy all JavaScript (except vendor scripts)
    // with sourcemaps all the way down
    var uglify = require('gulp-uglify');            // squash files
	var jshint = require('gulp-jshint');			// lint!
	return  gulp.src( source.scripts )
            .pipe( concat('main.min.js') )
    		.pipe( gulpif( squish, uglify() ) )
			.pipe( jshint('.jshintrc'))
			.pipe( jshint.reporter('default') )
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
			
			var fileName = sanitisedFileName( config.brand , type, model, ".html" );
			
			var html = distribution.html + fileName;
			var folder = release.html + type + '.'+model + '/';
			var size = config.sizes[ type ];

            console.log('' );
            console.info('Creating : '+fileName+'____________________________' );
            
			// create release folder
			var htmlStream = gulp.src( html )
			.pipe( rename( 'index.html' ))
			.pipe( replace(/<title>(.*)<\/title>/i, '<title>'+title+'</title>' ) )
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
			if ( config.manifests.enabled )
			{
				var 
                    extension = '.js',
					manifestFiles = [],
					manifestFile = 'manifest',
					manifestFolder = SOURCE_FOLDER+'scripts/',
					manifestVariant = manifestFolder+type+'.'+manifestFile+'.'+model + extension,
					manifest = manifestFolder+type+'.'+manifestFile + extension;

				// This first check is to see if the manifest for this specific vafriant exists,
                // for exmple this could be a language specific version of the manifest
				if( fs.existsSync( manifestVariant ) )
				{
					// Use custom Manifest file per variant...
                    // NB. Needs to be in the format, type.manifest.model.js
                    // EG. manifest.hk.js -> manifest when copied into the folder
					manifestFiles.push( manifestVariant );
					console.info('Custom Manifest FOUND! at : '+manifestVariant );
                    
				}else if( fs.existsSync( manifest ) )
				{
					// Use size Manifest file
					manifestFiles.push( manifest );
					//console.error('Custom Manifest NOT FOUND! at : '+manifestVariant );
                    console.log('Variant Manifest FOUND! at : '+manifest );
                    
				} else {
                    
					// Use default Manifest file
					manifestFiles.push( manifestFolder+'manifest.js' );
					console.error('Manifest missing for size '+type+' \n\t Please create the file : '+manifest+' else we will use the default');
				}

				var manifestStream = gulp.src( manifestFiles )
				// automatically update sizes within
				//.pipe( replace(/"width":300/, '"width":'+size.w ) )
				//.pipe( replace(/"height":250/, '"height":'+size.h ) )
				// and save into the correct distribution folder...
				.pipe( expect( manifestFiles ) )
				.pipe( rename( manifestFile + extension ) )
				.pipe( gulp.dest( release.html + type + '.'+model ));
			}
			
			
			// css
			var styleStream = gulp.src( distribution.styles +'/*.css' )
			.pipe( gulp.dest( folder + 'css' ));

			
			// add to merge
			merged.add( htmlStream );
			merged.add( imageStream );
			merged.add( variantStream );
			merged.add( fontStream );
			merged.add( scriptStream );
			if (manifestStream) merged.add( manifestStream );
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
			var fileName = getFileName( config.brand , type, model, ".zip", config.version+'-' );
			
			// NB. FlashTalking does *not* allow periods and such... so config.version is a no go
			//console.log(i + '. Zipping "'+fileName +'" from ' +folder);

			// keep directory structure
			var zipStream =  gulp.src( folder + '**/*' )
			.pipe( zip(fileName) )
			// console.log the filezie! :P
			.pipe( filesize( {title:fileName, showFiles:false } ) )
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
	gulp.watch( watch.scripts	, ['scripts'] ).on('change', function(event) { 	changeEvent(event); } );
	gulp.watch( watch.styles 	, ['less'] ).on('change', function(event) { 	changeEvent(event); } );
	gulp.watch( watch.jade  	, ['jade'] ).on('change', function(event) { 	changeEvent(event); } );
	gulp.watch( watch.images 	, ['images'] ).on('change', function(event) { 	changeEvent(event); } );
	gulp.watch( watch.fonts  	, ['copy'] ).on('change', function(event) { 	changeEvent(event); } );

	//gulp.watch( [ BUILD_FOLDER+'**/*' ] ).on('change', function (file) {
    	//gulp.src( file.path ).pipe( connect.reload() );
	//});
});




// Server =========================================================================

///////////////////////////////////////////////////////////////////////////////////
//
// TASK : Serve
//
// Start a webserver and display the index file
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










console.clear();


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
gulp.task('scaffold', function(callback) {
	sequencer(
		'configure',
		 [ 'jade-create', 'clone-manifests'] ,
    callback);
});

gulp.task('template', 	[ 'scaffold' ] );


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

/*
console.log, console.warn, console.error, console.info, console.debug, console.dir, console.trace
console.warn("Warning!");
console.info("Information");
console.table([ [1,2], [3,4] ]);
console.time("Timer");
console.timeEnd("Timer");
*/

gulp.task('help' , function(callback) {

	console.info( "-- Config ---------------------------------");
	console.info( 'Campaign\t: "'+config.brand+'" in '+varietiesToPackage.length +' variants' );
	console.info( 'Types\t: "'+config.types +'"' );
	console.info( 'Version\t: "'+config.version+'" ' );
	console.info( 'Description\t: "'+config.description+'" ' );
	console.info( 'Settings Location\t: "config.json" ' );

	console.info( varietiesToPackage.length + ' Campaign(s) Found : "'+varietiesToPackage+'" ' );
	console.info( "-- Tasks ----------------------------------");
	
	console.log( '');
	console.log( 'NB. Help (you can return here by typing "gulp" or "gulp help")');
	
    callback();
} );
