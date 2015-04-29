
// Image Tasks ====================================================================
///////////////////////////////////////////////////////////////////////////////////
//
// TASK 	: Images
// ACTION 	: Compress images and copy to destinations
//
///////////////////////////////////////////////////////////////////////////////////

module.exports = function (gulp, plugins) {
    // Copy all static images
    gulp.task('images', function() {
        return 	gulp.src( source.images)
                .pipe( newer(destination.images) )
                .pipe( gulp.dest( destination.images ) );
    });
};

module.exports = function (gulp, plugins) {
    // Copy all static images & squish
    gulp.task('images-release', function() {
        return 	gulp.src( source.images )
                //.pipe( newer(distribution.images) )
                .pipe( imagemin( imageCrunchOptions ) )
                .pipe( pngquant({optimizationLevel: 3})() )
                //.pipe( jpegoptim({ size:MAX_SIZE_JPEG })() )
                .pipe( gulp.dest( distribution.images ) );
                //.pipe( expect( source.images ) );
    });
};
