import {script} from "./fnelements.js";
import {fnstate} from "./fntags.js";

export const readyState = fnstate({ready: false})

let driveApi

let initialized = false

export default {
    async getFile(fileId) {
        return await driveApi.files.get({
            fileId: fileId
        })
    },
    async getFileContent(fileId) {
        return await driveApi.files.get({
            fileId: fileId,
            alt: 'media'
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
        return await driveApi.files.create({
            resource: fileMetadata,
            fields: 'id'
        })
    },
    async findFolders(name, parent = null) {
        return await this.findFiles(name, parent, 'application/vnd.google-apps.folder')
    },
    async findFiles(name, folderId = null, mimeType = null) {
        return (await driveApi.files.list({
            q: `name='${name}'${folderId ? ` and '${folderId}' in parents` : ""}${mimeType ? ` and mimeType='${mimeType}'` : ''}`,
            fields: 'files(id, name)',
            spaces: 'drive'
        })).result.files
    },
    async getShareLink(fileId) {
        const permissions = await driveApi.permissions.list({})
        if (!permissions.find(p => p.role === 'reader' && p.type === 'anyone')) {
            await driveApi.permissions.create({
                fileId: fileId,
                requestBody: {
                    role: 'reader',
                    type: 'anyone',
                }
            })
        }

        return await this.getFile(fileId)
    },
    async save(name, object, folderId = null) {

        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        const contentType = 'application/json';

        const metadata = {
            'name': name,
            'mimeType': contentType
        };
        if (folderId) metadata.parents = [folderId]

        const multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: ' + contentType + '\r\n\r\n' +
            JSON.stringify(object) +
            close_delim;

        const request = gapi.client.request({
            'path': '/upload/drive/v3/files',
            'method': 'POST',
            'params': {'uploadType': 'multipart'},
            'headers': {
                'Content-Type': 'multipart/related; boundary="' + boundary + '"'
            },
            'body': multipartRequestBody
        });
        await request.execute(callback);

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
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    scope: "https://www.googleapis.com/auth/drive"
}).then((res) => {
    driveApi = gapi.client.drive
    readyState.ready = true
    resolve(res)
})))



