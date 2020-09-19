import { fnstate } from '../lib/fntags.js'
import { apiGet } from './api.js'

export const isAuthenticated = fnstate( false )
export const chefLoaded = fnstate( false )
export const chef = fnstate( null )


if( window.location.href.match( 'authToken=' ) ) {
    const token = window.location.href.replace( /.*authToken=([a-zA-Z0-9+/=.]+).*/, "$1" )
    localStorage.setItem( 'auth_token', token )
    window.location.href = window.location.href.replace( /\??authToken=.*/, '' )
}

const token = localStorage.getItem( 'auth_token' )

if( !token ) {
    isAuthenticated( false )
    chefLoaded( true )
} else {
    let jwtInfo = JSON.parse( atob( token.split( '.' )[ 1 ] ) )
    apiGet( `/api/chef/${jwtInfo.sub}` )
        .then( res => {
            chef( res )
            chefLoaded( true )
            isAuthenticated( true )
        } )
        .finally( () => chefLoaded( true ) )
}

export function addAuthHeader( headers ) {return Object.assign( { authorization: 'Bearer ' + token }, headers )}

export const login = () => window.location.href = '/api/auth/google'