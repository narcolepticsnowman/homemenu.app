const glob = require( 'glob' )
const fs = require( 'fs-extra' )
const { minify } = require( 'terser' )
fs.removeSync( 'build' )
fs.copySync( '.', 'build' )

glob( 'build/**/*.js', ( err, files ) => {
    if( err ) throw err

    files.forEach( file => {
        minify(file).then(({code})=>fs.writeFileSync(file, code))
    } )
} )
