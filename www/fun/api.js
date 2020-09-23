import { addAuthHeader, chef, isAuthenticated } from './auth.js'
import showError from '../view/AppError.js'

const ensureSlash = ( path ) => path && path.startsWith( '/' ) ? path : '/' + path

export async function request ( path, method, body, headers ) {
    return fetch( path, {
        method,
        body: body ? JSON.stringify( body ) : body,
        headers: headers || {}
    } )
        .then( res => {
            if( ( res.status / 100 >> 0 ) !== 2 ) {
                if( res.status === 401 ) {
                    isAuthenticated( false )
                    throw new Error("Not Authorized")
                }
                console.error( 'Non-OK request: ', res.statusText )
                let err = new Error( `Non-OK request(${res.status}) : ${res.statusText}` )
                err.status = res.status
                err.statusText = res.statusText
                res.text().then( errBody => {
                    err.body = errBody
                    throw err
                } )
            }
            return res.json()
        } )
        .catch( err => {
            if( err.status >= 500 ) showError( 'Something Broke...', err )
            throw err
        } )
}

export const chefPath = ( path ) => `/api/chef/${chef().id}${ensureSlash( path )}`
export async function apiGet ( path, headers ) {return await request( path, 'GET', null, addAuthHeader( headers ) )}
export async function apiPost ( path, body, headers ) {return await request( path, 'POST', body, addAuthHeader( headers ) )}
