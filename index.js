const express = require('express');
const {ParseServer} = require('parse-server');
const cors = require('cors');
const app = express();
app.use(cors());

const api = new ParseServer({
    databaseURI: process.env.PARSE_SERVER_DATABASE_URI,
    appId: process.env.PARSE_SERVER_APPLICATION_ID,
    masterKey: process.env.PARSE_SERVER_MASTER_KEY,
    serverURL: 'http://localhost:3000/',
    port: process.env.PORT,
    mountPath: process.env.PARSE_SERVER_MOUNT_PATH,
    startLiveQueryServer: true,
    maxUploadSize: process.env.PARSE_SERVER_MAX_UPLOAD_SIZE,
    objectIdSize: process.env.PARSE_SERVER_OBJECT_ID_SIZE,
    filesAdapter: {
        module: 'parse-server-s3like-adapter',
        options: {
            accessKey: process.env.S3_ACCESS_KEY,
            bucket: process.env.S3_BUCKET,
            direct: false,
            endPoint: process.env.S3_ENDPOINT,
            secretKey: process.env.S3_SECRET_KEY,
        }
    },
    liveQuery: process.env.PARSE_SERVER_LIVE_QUERY,
});

app.use('/', api);

const httpServer = app.listen(3000, function () {
    console.log('BFast::Cloud DaaS running at port 3000.');
});
const parseLiveQueryServer = ParseServer.createLiveQueryServer(httpServer, {
    redisURL: 'redis://rdb:6379'
});