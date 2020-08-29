import {BFast} from "bfastnode";
const {ParseServer} = require('parse-server');
const parseSdk = require('parse/node');


const api = new ParseServer({
    databaseURI: process.env.MONGO_URL,
    appId: process.env.APPLICATION_ID,
    masterKey: process.env.MASTER_KEY,
    serverURL: 'http://localhost:3000/',
    port: process.env.PORT,
    mountPath: process.env.MOUNT_PATH,
    maxUploadSize: '4024mb',
    objectIdSize: 16,
    allowCustomObjectId: true,
});

export const v1server = BFast.functions().onGuard('/', api);
export const parseStyleFileUpload = BFast.functions().onPostHttpRequest('/storage', [
    (request, response, next) => {
        if (request.get('X-Parse-Application-Id') !== process.env.PARSE_SERVER_APPLICATION_ID) {
            response.status(403).json({message: 'unauthorized'});
            return;
        }
        const body = request.body;
        if (body && body.base64 && body.filename) {
            next();
        } else {
            response.status(400).json({message: 'can not save that file'});
        }
    },
    (request, response) => {
        parseSdk.initialize(process.env.PARSE_SERVER_APPLICATION_ID, null);
        const file = new Parse.File(request.body.filename, {base64: request.body.base64},
            request.body.type ? request.body.type : null);
        file.save().then(file => {
            response.json({url: file.url({forceSecure: true})});
        }).catch(error => {
            response.status(400).json(error);
        });
    }
]);
