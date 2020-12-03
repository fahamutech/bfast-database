const {BFast} = require("bfastnode");
const {BfastDatabaseCore, EnvUtil} = require('bfast-database-core');

const bfastDatabase = new BfastDatabaseCore();
const envUtil = new EnvUtil();

class BfastController {

    getBFastDatabaseConfigs() {
        let isS3Configured = true;
        const s3Bucket = envUtil.getEnv(process.env.S3_BUCKET);
        const s3AccessKey = envUtil.getEnv(process.env.S3_ACCESS_KEY);
        const s3SecretKey = envUtil.getEnv(process.env.S3_SECRET_KEY);
        const s3Endpoint = envUtil.getEnv(process.env.S3_ENDPOINT);

        const checker = [];
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
        return {
            applicationId: process.env.PRODUCTION === '0' ? 'bfast' : envUtil.getEnv(process.env.APPLICATION_ID),
            masterKey: process.env.PRODUCTION === '0' ? 'bfast' : envUtil.getEnv(process.env.MASTER_KEY),
            mongoDbUri: process.env.PRODUCTION === '0' ? 'mongodb://localhost/bfast' : envUtil.getEnv(process.env.MONGO_URL),
            adapters: {
                s3Storage: isS3Configured
                    ? {
                        bucket: s3Bucket,
                        endPoint: s3Endpoint,
                        secretKey: s3SecretKey,
                        accessKey: s3AccessKey,
                    } : undefined,
            }
        }
    }

    initServices() {
        bfastDatabase.initiateServices(this.getBFastDatabaseConfigs());
    }

    async startDatabaseEngine() {
        return bfastDatabase.init(this.getBFastDatabaseConfigs());
    }

    async initiateBFastClients() {
        BFast.init({
            applicationId: process.env.PRODUCTION === '0' ? 'bfast' : await envUtil.getEnv(process.env.APPLICATION_ID),
            projectId: process.env.PRODUCTION === '0' ? 'bfast' : await envUtil.getEnv(process.env.PROJECT_ID),
            appPassword: process.env.PRODUCTION === '0' ? 'bfast' : await envUtil.getEnv(process.env.MASTER_KEY),
            databaseURL: `http://localhost:${process.env.PRODUCTION === '0' ? process.env.DEV_PORT : await envUtil.getEnv(process.env.PORT)}`,
            functionsURL: `http://localhost:${process.env.PRODUCTION === '0' ? process.env.DEV_PORT : await envUtil.getEnv(process.env.PORT)}`,
        });
    }
}

module.exports = {
    BfastController: BfastController
}
