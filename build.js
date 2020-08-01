const glob = require( 'glob' )
const fs = require( 'fs-extra' )
const { minify } = require( 'terser' )
fs.removeSync( 'build' )
fs.mkdirSync("build");
[ 'src', 'www', 'www.js' ]
    .forEach( path => fs.copySync( path, 'build/' + path ) )


glob( 'build/www/ui/**/*.js', ( err, files ) => {
    if( err ) throw err

    files.forEach( file => {
        fs.writeFileSync( file, minify( fs.readFileSync(file).toString("utf-8") ).code )
    } );
    //copy after minify so we don't mess with it
    [ 'node_modules' ].forEach( path => fs.copySync( path, 'build/' + path ) )
} )
