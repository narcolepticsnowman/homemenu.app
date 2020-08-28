import { script } from '../lib/fnelements.js'
import { fnstate } from '../lib/fntags.js'

export const isReady = fnstate( false )


let initialized = false

//TODO this only works when name is included
const textContains = ( search ) => search ? ` and fullText contains '${search}'` : ''
const parentIs = ( folderId ) => folderId ? ` and '${folderId}' in parents` : ''
const mimeTypeIs = ( mimeType ) => mimeType ? ` and mimeType='${mimeType}'` : ''
const nameIs = ( name ) => name ? ` and name='${name}'` : ''

// const execute = async (req)=> new Promise(resolve=>req.execute(resolve))

let fileIds = []

const newFileId = async() => {
    if( fileIds.length < 1 ) {
        let res = await gapi.client.request( {
                                                 path: '/drive/v3/files/generateIds',
                                                 method: 'GET',
                                                 params: {
                                                     count: 100,
                                                     space: 'drive'
                                                 }
                                             } )
        fileIds = res.result.ids
    }
    return fileIds.pop()
}

const googleMetaFromDriveMeta = async( driveMeta ) => {
    if( !driveMeta ) driveMeta = {}
    return {
        id: driveMeta.id || ( driveMeta.id = await newFileId() ),
        name: driveMeta.name || '',
        parents: driveMeta.folderId ? [ driveMeta.folderId ] : [],
        mimeType: driveMeta.mimeType || 'application/json',
        appProperties: {
            lastUpdated: new Date().getTime(),
            createdAt: driveMeta.createdAt || new Date().getTime()
        }
    }
}

const multipartRequest = async( { fileContent, metaData, path, method, params } ) => {
    const boundary = '-------314159265358979323846'
    const delimiter = '\r\n--' + boundary + '\r\n'
    const close_delim = '\r\n--' + boundary + '--'

    let multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify( metaData )

    if( fileContent )
        multipartRequestBody += delimiter +
                                'Content-Type: application/json\r\n\r\n' +
                                JSON.stringify( fileContent ) +
                                close_delim
    else
        multipartRequestBody += close_delim

    return await gapi.client.request( {
                                          'path': path,
                                          'method': method,
                                          'params': Object.assign( params || {}, { 'uploadType': 'multipart' } ),
                                          'headers': {
                                              'Content-Type': 'multipart/related; boundary="' + boundary + '"'
                                          },
                                          'body': multipartRequestBody
                                      } )
}

export default {
    async getFileMeta( fileId ) {
        let res = await gapi.client.request( {
                                                 path: '/drive/v3/files/' + fileId,
                                                 params: {
                                                     fields: '*'
                                                 }
                                             } )
        return res.result
    },
    async getFileContent( fileId ) {
        return await gapi.client.request( {
                                              path: '/drive/v3/files/' + fileId,
                                              params: { alt: 'media' }
                                          } )
    },
    async getOrCreateFolder( name, parent = null ) {
        let folders = null
        try {
            folders = await this.findFolders( name, parent )
        } catch(e) {
            if( !( e.result && e.result.error.code === 404 ) ) {
                throw e
            }
        }

        if( folders && folders.length > 0 ) {
            return folders[ 0 ]
        } else {
            return await this.createFolder( name, parent )
        }
    },
    async createFolder( name, parent = null ) {
        let response = await multipartRequest( {
                                                   path: '/upload/drive/v3/files',
                                                   method: 'POST',
                                                   metaData: {
                                                       name,
                                                       'mimeType': 'application/vnd.google-apps.folder',
                                                       parents: parent ? [ parent ] : []
                                                   }
                                               } )
        return response.result
    },
    async findFolders( name, parent = null ) {
        return await this.findFiles( { name, folderId: parent, mimeType: 'application/vnd.google-apps.folder' } )
    },
    async findFiles( { name, folderId, mimeType, fullText } ) {
        let files = await gapi.client.request( {
                                                   path: '/drive/v3/files',
                                                   params: {
                                                       q: `trashed=false${nameIs( name )}${parentIs( folderId )}${mimeTypeIs( mimeType )}${textContains( fullText )}`,
                                                       fields: 'files(*)',
                                                       spaces: 'drive'
                                                   }
                                               } )
        return files.result.files
    },
    async getShareLink( fileId ) {
        const permissions = await gapi.client.request( {
                                                           path: `/drive/v3/files/${fileId}/permissions`
                                                       } )
        if( !permissions.find( p => p.role === 'reader' && p.type === 'anyone' ) ) {
            await gapi.client.request( {
                                           path: `/drive/v3/files/${fileId}/permissions`,
                                           method: 'POST',
                                           body: JSON.stringify( {
                                                                     role: 'reader',
                                                                     type: 'anyone'
                                                                 } )
                                       } )
        }

        return await this.getFileMeta( fileId )
    },
    async loadObject( fileId ) {
        let content = await this.getFileContent( fileId )
        return content.result
    },
    async save( object ) {
        let isCreate = !( object && object.driveMeta && object.driveMeta.id )
        object.driveMeta = await googleMetaFromDriveMeta( object.driveMeta )
        if( isCreate ) {
            const res = await multipartRequest( {
                                                    fileContent: object,
                                                    metaData: object.driveMeta,
                                                    path: '/upload/drive/v3/files',
                                                    method: 'POST'
                                                } )
            object.driveMeta.id = res.result.id
            return res.result
        } else {
            const meta = Object.assign( {}, object.driveMeta )
            delete meta.id
            const res = await multipartRequest(
                {
                    fileContent: object,
                    metaData: meta,
                    path: '/upload/drive/v3/files/' + object.driveMeta.id,
                    method: 'PATCH'
                }
            )
            return res.result
        }
    },
    init( clientId, apiKey ) {
        return new Promise( resolve => {
                                if( !initialized ) {
                                    initialized = true
                                    document.body.appendChild( script( {
                                                                           src: 'https://apis.google.com/js/api.js',
                                                                           onload: () => handleLoaded( clientId, apiKey ).then( res => {
                                                                               resolve( res )
                                                                           } ),
                                                                           async: true,
                                                                           defer: true
                                                                       } ) )
                                } else {
                                    resolve()
                                }
                            }
        )
    }
}


const handleLoaded = ( clientId, apiKey ) => new Promise( resolve => gapi.load( 'client:auth2', () => gapi.client.init( {
                                                                                                                            apiKey: apiKey,
                                                                                                                            clientId: clientId,
                                                                                                                            discoveryDocs: [],
                                                                                                                            scope: 'https://www.googleapis.com/auth/drive'
                                                                                                                        } ).then( ( res ) => {
    isReady(true)
    resolve( res )
} ) ) )



