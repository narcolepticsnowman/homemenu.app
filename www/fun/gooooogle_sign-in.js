import { fnstate } from '../lib/fntags.js'

export const GoogleUser = fnstate( {} )

export const isAuthenticated = fnstate( false)
export const authLoaded = fnstate(false)



let GoogleAuth

const handleLoaded = () => {
    authLoaded(true)
    if( GoogleAuth.isSignedIn.get() ) {
        GoogleUser(GoogleAuth.currentUser.get())
        isAuthenticated( true)

    }
}

export const init = () => {
    GoogleAuth = gapi.auth2.getAuthInstance()
    GoogleAuth.then( handleLoaded, console.error )
}

export const login = ( options ) => GoogleAuth.signIn( options ).then( ( user ) => {

    if( user ) {
        GoogleUser(user)
        isAuthenticated( true)
    }

} )