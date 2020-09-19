#!/usr/bin/env node
const fs = require( 'fs' )
let envFile = require( 'os' ).homedir() + '/.dinner-at-home.env'
if( fs.existsSync( envFile ) ) {
    const appEnv = require( envFile )
    Object.assign( process.env, appEnv )
}


env = process.env.DEPLOY_MODE || 'dev'
const auth = require( './apiAuth.js' )
require( 'spliffy' )(
    {
        port: 80,
        routeDir: __dirname + '/www',
        // cacheStatic: true,
        middleware: [ auth.init() ],
        decodeQueryParameters: true,
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