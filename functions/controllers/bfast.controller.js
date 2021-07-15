const {EnvUtil} = require('bfast-database-core');
const envUtil = new EnvUtil();

class BfastController {

    /**
     *
     * @return {{
     * mongoDbUri: string,
     * adapters: {s3Storage: ({bucket: string, endPoint: string, secretKey: string, accessKey: string, region: string}|undefined)},
     * masterKey: string,
     * port: (string|string),
     * applicationId: string,
     * projectId: string,
     * rsaKeyPairInJson: *,
     * rsaPublicKeyInJson: *,
     * logs: boolean,
     * taarifaToken: string
     * }}
     */
    getBFastDatabaseConfigs() {
        let isS3Configured = true;
        const s3Bucket = envUtil.getEnv(process.env.S3_BUCKET);
        const s3AccessKey = envUtil.getEnv(process.env.S3_ACCESS_KEY);
        const s3SecretKey = envUtil.getEnv(process.env.S3_SECRET_KEY);
        const s3Endpoint = envUtil.getEnv(process.env.S3_ENDPOINT);
        const s3Region = envUtil.getEnv(process.env.S3_REGION);

        let checker = [];
        checker.push(s3Bucket, s3AccessKey, s3SecretKey, s3Endpoint, s3Region);
        checker = checker.filter(x => {
            if (!x) {
                return false;
            } else if (x.toString() === 'null') {
                return false;
            } else if (x.toString() === 'undefined') {
                return false;
            } else return x.toString() !== '';
        })
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
        const port = envUtil.getEnv(process.env.PORT);
        return {
            applicationId: envUtil.getEnv(process.env.APPLICATION_ID),
            projectId: envUtil.getEnv(process.env.PROJECT_ID),
            masterKey: envUtil.getEnv(process.env.MASTER_KEY),
            logs: envUtil.getEnv(process.env.LOGS) === '1',
            port: port ? port : '3000',
            taarifaToken: envUtil.getEnv(process.env.TAARIFA_TOKEN),
            mongoDbUri: envUtil.getEnv(process.env.MONGO_URL),
            rsaKeyPairInJson: envUtil.getEnv(process.env.RSA_KEY),
            rsaPublicKeyInJson: envUtil.getEnv(process.env.RSA_PUBLIC_KEY),
            adapters: {
                s3Storage: isS3Configured ? {
                    bucket: s3Bucket,
                    endPoint: s3Endpoint,
                    secretKey: s3SecretKey,
                    accessKey: s3AccessKey,
                    region: s3Region
                } : undefined,
            }
        }
    }
}

module.exports = {
    BfastController: BfastController
}
