import {fnstate} from "fntags";

export const GoogleUser = fnstate({current: {}})

export const authState = fnstate({isAuthenticated: false, isLoaded: false})

let GoogleAuth;

const handleLoaded = () => {
    authState.isLoaded = true
    if (GoogleAuth.isSignedIn.get()) {
        GoogleUser.current = GoogleAuth.currentUser.get()
        authState.isAuthenticated = true
    }
}

export const init = () => {
    GoogleAuth = gapi.auth2.getAuthInstance();
    GoogleAuth.then(handleLoaded, console.error)
}

export const login = (options) => GoogleAuth.signIn(options).then((user) => {

    if (user) {
        GoogleUser.current = user
        authState.isAuthenticated = true
    }

})