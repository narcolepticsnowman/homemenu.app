import { fnstate } from '../lib/fntags.js'
import { apiGet } from './api.js'
import { div, img } from '../lib/fnelements.js'
import { colors } from './constants.js'
import { centeredBlock } from '../view/component/centeredBlock.js'

export const isAuthenticated = fnstate( false )
export const chefLoaded = fnstate( false )
export const chef = fnstate( null )
const tokenKey = 'auth_token'

if( window.location.href.match( 'authToken=' ) ) {
    const token = window.location.href.replace( /.*authToken=([a-zA-Z0-9+/=_\-.]+).*/, '$1' )
    localStorage.setItem( tokenKey, token )
    window.location.href = window.location.href.replace( /\??authToken=.*/, '' )
}

const token = localStorage.getItem( tokenKey )

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

export const logout = () => {
    localStorage.removeItem( tokenKey )
    window.location.href = '/'
}

export const loginForm = function() {
    return centeredBlock(
        div( { style: { 'font-size': '4vh', color: colors.orange } }, 'Menu Board' ),
        img( { src: '/images/google_sign_in_btn.png', style: { cursor: 'pointer' }, onclick: () => login() } )
    )
}