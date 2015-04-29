///////////////////////////////////////////////////////////////////////////////////
//
// TASK 	: Load in our external settings and overwrite our objects
// ACTION 	: Deletes all files and folders specified in the arguments
//
///////////////////////////////////////////////////////////////////////////////////
module.exports = function (gulp, plugins) {
    gulp.task('configuration-save', function(cb) {
        return gulp.src( settings )
            .pipe( expect( settings ) )
            .on( 'error', function (err) { console.error(err); } )
            .pipe( replace( /(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm , '' ) )
            .pipe( rename( renamed ) )
            .pipe( gulp.dest( '' ) );
    });
};

module.exports = function (gulp, plugins, config) {
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
};

module.exports = function (gulp, plugins) {
    gulp.task('configure', function(callback) {
        sequencer(
            'configuration-save',
            'configuration-load',
        callback);
    });
};