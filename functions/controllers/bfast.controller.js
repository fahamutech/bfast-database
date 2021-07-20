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
            rsaKeyPairInJson: {
                "p": "zULI9aVyYabSWFLeGiYQXEu7Sql732aFEurqFeP14P2yN-4x9KIPVbHed8gAyPJOwgC3_IvZkF_zOPgwz1M-kbWBdcaJv2uG9LP8QlWvqAW9V6PpaiaDZvYWgsWCu2rEJTzLZev47drvimtw7iHHPRcPrBoRZsQ4VpnSml-Xb_E",
                "kty": "RSA",
                "q": "vueCAtz91YFBfAZ80k5vukbkBeYFUuYYwPtzdqLNzfvKvm9fe4jvPbg3HNxzrIuxhYJGMsOirpE4Fpy_Tsm8UZFbZIEYqi0nNrHWaiE5RaOQ2k5OWalnsJ9bhchtDJ-q7t72mpq5ZFb-b1BAMb1NsU8B2_-JuCgrKDZZI4sim3c",
                "d": "MBNeHNrlnC5Cc3pr2qZI3g0EdvLs2vUziUtsWfm2sVRXME1X1cdOMQ48IfHnnwK2Lct9v3J9suq-Y3bb7fGOyF_ckYqGLFZrjFFR7dOAPabdtxJ0rW9p7-8Uk8Pnj5GR1jAC--8Y2NJiU5k2VvKcCy3NYuByU8wTyQJKxVYF1aMsBCp8pHMkve1y8DW9Dt987rIlHK11lNmy93IzeXAn2bRFAxV6J8383v5bk3CdMrr_9n1NSNxu_qlekKGA1w-haZ01P1adD21tuUxZ5HhkgsDce4sHhTzvQM7gLKnTtawLUjKI4AqhCUOdKaoar1JCZHpui6t2orBm-uB9lseBAQ",
                "e": "AQAB",
                "use": "sig",
                "qi": "HvelfjLNaDpIzZr9IDIJgg532kFYORc_DnhUWrEkDA3-EjXPiOb4tHzBDjJ-OizPECLjVFRLRzRQhwej5ZOI9vuJdX-vRO4Wx5gpQ0EQxHDp4nByV5Z3HjjJvnFV0QDgoxCHVNwnltUqO-xS0VEiMNooiLPQ97GSkNmKTMIZwg8",
                "dp": "msX2FExJwFpzF4h80wjKo12zfyvnLN_4Dfi2xATdXWbO4J-qaYVdvMdfMcDM3rjfLCgwk6y8Q8Il-1oiK-LgNiy_zpgDPCSPYarp1vcXecHCMPh2w8UApj1_YeIensV124JI-LSDQo8oup4jTFyKCIWAGsyZPH1O4fYhOKhF33E",
                "alg": "RS256",
                "dq": "eGuYey3jgFY0dIOzIQYRPDOTipT6LryuSK1UvDUeFR0LWuzuEgLixs_5E9-Lp__GTy1KEqONbwhzlO_zTUO74sgKGm_EmzQ4VCwB0Jh8hA0VRl-21KAjpCohlVZEU340WNGURRnsb_rgLF823ylGZN4tkhSzTtMnxgniWKVfgyk",
                "n": "mREwp9w2aYM3cLBL4MkF7JJ80NT3UVATFZPR5s3Dcg8HuAWsQ6VPZrvPpdVWEwhSlkICUy46xOfWyXFRJeBR6ICb04O6PXIFAj_alFCRE-NJszEycUaiKxgIynpSBuETGZfX8-M0uzCXtFQY4Cxpb9rlPo4kqraRU1pJ64OSTYZkwc4D8C2rFM1_WfXnCkvml_vK7Knq_YJdanWQQMPmBK7LE8Yi06PLl2UCaFANQ2axZIN0iTayfnTNkShzMDA5DogRp8tcCm8N7nR96UH9Bc2J9E0YSVt6QSZt-83CQ4pzs3XtQZdfFAoc66OltadoqXyGrvj5F6gq4WB62S30Bw"
            },
            rsaPublicKeyInJson: {
                "kty": "RSA",
                "e": "AQAB",
                "use": "sig",
                "alg": "RS256",
                "n": "mREwp9w2aYM3cLBL4MkF7JJ80NT3UVATFZPR5s3Dcg8HuAWsQ6VPZrvPpdVWEwhSlkICUy46xOfWyXFRJeBR6ICb04O6PXIFAj_alFCRE-NJszEycUaiKxgIynpSBuETGZfX8-M0uzCXtFQY4Cxpb9rlPo4kqraRU1pJ64OSTYZkwc4D8C2rFM1_WfXnCkvml_vK7Knq_YJdanWQQMPmBK7LE8Yi06PLl2UCaFANQ2axZIN0iTayfnTNkShzMDA5DogRp8tcCm8N7nR96UH9Bc2J9E0YSVt6QSZt-83CQ4pzs3XtQZdfFAoc66OltadoqXyGrvj5F6gq4WB62S30Bw"
            },
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
