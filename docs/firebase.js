import {fnstate} from "./fntags.js";

const firebaseConfig = {
    apiKey: "AIzaSyDmaQbkeo-pYMRbV2jiealTpjMTpTPH2kk",
    authDomain: "dinner-at-home.firebaseapp.com",
    databaseURL: "https://dinner-at-home.firebaseio.com",
    projectId: "dinner-at-home",
    storageBucket: "dinner-at-home.appspot.com",
    messagingSenderId: "601450421542",
    appId: "1:601450421542:web:12f21f11c9bbbfe5c135e7",
    measurementId: "G-FC4WQX18R8"
}

export const firebaseUser = fnstate({current: {}})

export const authState = fnstate({isAuthenticated: false, isLoaded: false})

export const initFirebase = () => {
    firebase.initializeApp(firebaseConfig);
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            authState.isLoaded = true
            firebaseUser.current = user
            authState.isAuthenticated = true
        } else {
            firebase.auth().getRedirectResult().then(function (result) {
                if (result.user) {
                    firebaseUser.current = result.user
                    authState.isAuthenticated = true
                }
                authState.isLoaded = true
            }).catch(console.error);
        }
    });
}

export const login = () => {
    let provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
}

