import {DaaSServer} from "./daas";

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

new DaaSServer({
    applicationId: process.env.APPLICATION_ID,
    masterKey: process.env.MASTER_KEY,
    mongoDbUri: process.env.MONGO_URL,
    port: process.env.PORT,
    mountPath: process.env.MOUNT_PATH,
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
}).start().catch(console.log);
