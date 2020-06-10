#!/usr/bin/env node
env = process.env.DEPLOY_MODE || 'dev'
const authFilter = require( './src/filters/google_oauth.js' )
require( 'spliffy' )(
    {
        routeDir: __dirname + '/www',
        cacheStatic: true,
        filters: [ authFilter ],
        secure: env !== 'dev' ?
            {
                port: 443,
                letsEncrypt: {
                    directory: env === 'prod' ? 'production' : 'staging',
                    termsOfServiceAgreed: true,
                    email: 'admin@homemenu.app',
                    domains: [ 'www.homemenu.app', 'homemenu.app' ],
                    certPath: __dirname + '/certs/letsEncrypt'
                }
            } : undefined
    }
)