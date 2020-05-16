const express = require('express');
// const cookieParser = require('cookie-parser');
// const logger = require('morgan');
const {ParseServer} = require('parse-server');
const parseSdk = require('parse/node');
// const cors = require('cors');
const app = express();
// app.use(logger('dev'));
// app.use(express.json({
//     limit: '4024mb'
// }));
// app.use(express.urlencoded({extended: false}));
// app.use(cookieParser());
// app.use(cors());
// app.options('*', cors());

const api = new ParseServer({
    databaseURI: process.env.PARSE_SERVER_DATABASE_URI,
    appId: process.env.PARSE_SERVER_APPLICATION_ID,
    masterKey: process.env.PARSE_SERVER_MASTER_KEY,
    serverURL: 'http://localhost:3000/',
    port: process.env.PORT,
    mountPath: process.env.PARSE_SERVER_MOUNT_PATH,
    maxUploadSize: '4024mb',
    objectIdSize: 16,
    allowCustomObjectId: true,
    filesAdapter: {
        module: 'bfast-s3like',
        options: {
            accessKey: process.env.S3_ACCESS_KEY,
            bucket: process.env.S3_BUCKET.toLowerCase(),
            direct: false,
            endPoint: process.env.S3_ENDPOINT,
            secretKey: process.env.S3_SECRET_KEY,
        }
    },
    liveQuery: process.env.PARSE_SERVER_LIVE_QUERY,
});

app.use('/', api);
app.post('/storage', [
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

const httpServer = app.listen(Number(process.env.PORT), function () {
    console.log('BFast::Cloud DaaS running at port 3000.');
});
const parseLiveQueryServer = ParseServer.createLiveQueryServer(httpServer, {
    // redisURL: 'redis://rdb:6379'
});
