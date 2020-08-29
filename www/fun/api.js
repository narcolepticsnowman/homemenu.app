import { chef, isAuthenticated } from './auth.js'
import showError from '../view/AppError.js'

const ensureSlash = ( path ) => path && path.startsWith( '/' ) ? path : '/' + path

export const request = async( path, method, body, headers ) =>
    fetch( path, {
        method,
        body: body ? JSON.stringify( body ) : body,
        headers: headers || {}
    } )
        .then( res => {
            if( (res.status / 100 >> 0) !== 2 ) {
                if( res.status === 401 ) {
                    isAuthenticated( false )
                }
                console.error( 'Non-OK request: ', res.statusText)
                throw new Error(`Non-OK request(${res.status}) : ${res.statusText}`)
            }
            return res.json()
        } )
        .catch( err => showError( 'Something Broke...', err ) )

export const chefPath = ( path ) => `/api/chef/${chef().id}${ensureSlash( path )}`
export const get = async( path, headers ) => await request( path, 'GET', null, headers )
export const post = async( path, body, headers ) => await request( path, 'POST', body, headers )
