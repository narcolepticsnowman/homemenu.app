import { fnstate } from '../lib/fntags.js'
import { script } from '../lib/fnelements.js'

export const GoogleUser = fnstate( {} )

export const isAuthenticated = fnstate( false )
export const authLoaded = fnstate( false )

export const chef = fnstate( { id: '1234' } )

let GoogleAuth

const clientId = '601450421542-3fmfpref2qphpet3jq4qj3a5gge28bm0.apps.googleusercontent.com'
const apiKey = 'AIzaSyDJFL-DprA2DFg_GEzGPrMLuFLTJl0p8mY'


const handleLoaded = () => {
    authLoaded( true )
    if( GoogleAuth.isSignedIn.get() ) {
        GoogleUser( GoogleAuth.currentUser.get() )
        isAuthenticated( true )
    }
}

export const init = () => {
    if( !authLoaded() ) {
        document.body.appendChild(
            script(
                {
                    src: 'https://apis.google.com/js/api.js',
                    onload: () => {
                        gapi.load(
                            'client:auth2',
                            () => gapi.client.init(
                                {
                                    apiKey: apiKey,
                                    clientId: clientId,
                                    discoveryDocs: [],
                                    scope: 'profile'
                                } ).then( () => {
                                GoogleAuth = gapi.auth2.getAuthInstance()
                                GoogleAuth.then( handleLoaded, console.error )
                            } )
                        )
                    },
                    async: true,
                    defer: true
                }
            )
        )
    }
}

export const login = ( options ) => GoogleAuth.signIn( options ).then( ( user ) => {
    if( user ) {
        GoogleUser( user )
        isAuthenticated( true )
    }
} )