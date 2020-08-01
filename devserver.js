require( 'spliffy' )(
    {
        port: 80,
        routeDir: __dirname + '/www',
        staticMode: true,
        notFoundRoute: '/',
        watchFiles: true
    }
)