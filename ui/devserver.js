require( 'spliffy' )(
    {
        port: 8000,
        routeDir: __dirname + '/dist',
        staticMode: true,
        notFoundRoute: '/',
        watchFiles: true
    }
)