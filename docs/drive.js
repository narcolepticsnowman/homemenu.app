import {script} from "./fnelements.js";
import {fnstate} from "./fntags.js";

export const readyState = fnstate({ready: false})


let initialized = false

//TODO this only works when name is included
const textContains = (search) => search ? ` and fullText contains '${search}'` : ''
const parentIs = (folderId) => folderId ? ` and '${folderId}' in parents` : ''
const mimeTypeIs = (mimeType) => mimeType ? ` and mimeType='${mimeType}'` : ''
const nameIs = (name) => name ? ` and name='${name}'` : ''

// const execute = async (req)=> new Promise(resolve=>req.execute(resolve))

let fileIds = []

const newFileId = async () => {
    if (fileIds.length < 1) {
        let res = await gapi.client.request({
            path: '/drive/v2/files/generateIds',
            method: 'GET',
            params: {
                maxResults: 100,
                space: 'drive'
            },
        })
        fileIds = res.result.ids
    }
    return fileIds.pop()
}

const updateFile = async (object) => {
    return await gapi.client.request({
        path: '/upload/drive/v3/files/' + object.driveMeta.id,
        method: 'PATCH',
        params: {
            uploadType: 'media',
        },
        body: JSON.stringify(object)
    })
}

const uploadNew = async (object) => {
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const metadata = {}

    if (object.driveMeta.name) metadata.name = object.driveMeta.name.toString()
    if (object.driveMeta.id) {
        metadata.id = object.driveMeta.id
    } else {
        metadata.id = await newFileId()
        object.driveMeta.id = metadata.id
    }
    if (object.driveMeta.folderId) metadata.parents = [object.driveMeta.folderId]
    if (object.driveMeta.mimeType) metadata.mimeType = object.driveMeta.mimeType

    const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(object) +
        close_delim;

    return await gapi.client.request({
        'path': '/upload/drive/v3/files',
        'method': 'POST',
        'params': {'uploadType': 'multipart'},
        'headers': {
            'Content-Type': 'multipart/related; boundary="' + boundary + '"'
        },
        'body': multipartRequestBody
    })
}


export default {
    async getFileInfo(fileId) {
        return await gapi.client.request({
            path: '/drive/v3/files/' + fileId
        })
    },
    async getFileContent(fileId) {
        return await gapi.client.request({
            path: '/drive/v3/files/' + fileId,
            params: {alt: 'media'}
        })
    },
    async getOrCreateFolder(name, parent = null) {
        let f = await this.findFolders(name, parent)
        if (!f) {
            f = this.createFolder(name, parent)
        }
    },
    async createFolder(name, parent = null) {
        let fileMetadata = {
            name,
            'mimeType': 'application/vnd.google-apps.folder'
        };
        if (parent) fileMetadata.parents = [parent]
        let response = await gapi.client.request({
            path: '/drive/v3/files',
            method: 'POST',
            params: {
                uploadType: 'media'
            },
            body: JSON.stringify(fileMetadata)
        })
        return response.result
    },
    async findFolders(name, parent = null) {
        return await this.findFiles(name, parent, 'application/vnd.google-apps.folder')
    },
    async findFiles({name, folderId, mimeType, fullText}) {
        let files = await gapi.client.request({
            path: '/drive/v3/files',
            params: {
                q: `trashed=false${nameIs(name)}${parentIs(folderId)}${mimeTypeIs(mimeType)}${textContains(fullText)}`,
                fields: 'files(*)',
                spaces: 'drive'
            }
        })
        return files.result.files
    },
    async getShareLink(fileId) {
        const permissions = await gapi.client.request({
            path: `/drive/v3/files/${fileId}/permissions`
        })
        if (!permissions.find(p => p.role === 'reader' && p.type === 'anyone')) {
            await gapi.client.request({
                path: `/drive/v3/files/${fileId}/permissions`,
                method: 'POST',
                body: JSON.stringify({
                    role: 'reader',
                    type: 'anyone',
                })
            })
        }

        return await this.getFileInfo(fileId)
    },
    async loadObject(fileId) {
        let content = await this.getFileContent(fileId)
        return content.result
    },
    async save(object) {
        if (!object.driveMeta) {
            object.driveMeta = {}
        }
        if (!object.driveMeta.mimeType) {
            object.driveMeta.mimeType = "application/json"
        }
        if (object.driveMeta.id) {
            let res = await updateFile(object)
            return res.result
        } else {
            const res = await uploadNew(object)
            object.driveMeta.id = res.result.id
            return res.result
        }
    },
    init(clientId, apiKey) {
        return new Promise(resolve => {
                if (!initialized) {
                    initialized = true
                    document.body.appendChild(script({
                        src: "https://apis.google.com/js/api.js",
                        onload: () => handleLoaded(clientId, apiKey).then(res => {
                            resolve(res)
                        }),
                        async: true,
                        defer: true
                    }))
                } else {
                    resolve()
                }
            }
        )
    }
}


const handleLoaded = (clientId, apiKey) => new Promise(resolve => gapi.load('client:auth2', () => gapi.client.init({
    apiKey: apiKey,
    clientId: clientId,
    discoveryDocs: [],
    scope: "https://www.googleapis.com/auth/drive"
}).then((res) => {
    readyState.ready = true
    resolve(res)
})))



