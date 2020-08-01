import {DaaSServer} from "./daas";

/*
- PARSE_SERVER_APPLICATION_ID=${appId}
  - PARSE_SERVER_MASTER_KEY=${masterKey}
  - PROJECT_ID=${projectId}
  - PARSE_SERVER_DATABASE_URI=mongodb://${appId}:${masterKey}@1.mongo.fahamutech.com:27017,2.mongo.fahamutech.com:27017,3.mongo.fahamutech.com:27017/${projectId}?authSource=admin&replicaSet=mdbRepl
  - PARSE_SERVER_START_LIVE_QUERY_SERVER=1
  - PARSE_SERVER_LIVE_QUERY={"classNames":["stocks","sales","purchases","units","categories","accounts","suppliers","orders"]}
  - PARSE_SERVER_MAX_UPLOAD_SIZE=1048576mb
  - PARSE_SERVER_OBJECT_ID_SIZE=16
  - PARSE_SERVER_SCHEMA_CACHE_TTL=10000
  - PORT=3000
  - PARSE_SERVER_MOUNT_PATH=/
  - S3_BUCKET=
  - S3_ACCESS_KEY=
  - S3_SECRET_KEY=
  - S3_ENDPOINT=https://eu-central-1.linodeobjects.com/
 */

let isS3Configured = true;
const s3Bucket = process.env.S3_BUCKET;
const s3AccessKey = process.env.S3_ACCESS_KEY;
const s3SecretKey = process.env.S3_SECRET_KEY;
const s3Endpoint = process.env.S3_ENDPOINT;

const checker: any[] = [];
checker.push(s3Bucket, s3AccessKey, s3SecretKey, s3Endpoint);

if (checker.length === 0) {
    isS3Configured = false;
} else {
    checker.forEach(value => {
        if (!value) {
            isS3Configured = false;
        } else if (value.toString() === 'null') {
            isS3Configured = false;
        } else if (value.toString() === 'undefined') {
            isS3Configured = false;
        } else if (value.toString() === '') {
            isS3Configured = false;
        }
    })
}

new DaaSServer().start({
    applicationId: process.env.PARSE_SERVER_APPLICATION_ID,
    masterKey: process.env.PARSE_SERVER_MASTER_KEY,
    mongoDbUri: process.env.PARSE_SERVER_DATABASE_URI,
    port: process.env.PORT,
    mountPath: process.env.PARSE_SERVER_MOUNT_PATH,
    adapters: {
        s3Storage: isS3Configured
            ? {
                bucket: s3Bucket,
                endPoint: s3Endpoint,
                secretKey: s3SecretKey,
                accessKey: s3AccessKey,
                direct: false,
            } : undefined,
    }
}).catch(console.log);
