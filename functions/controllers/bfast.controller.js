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
        // if (!process.env.PRODUCTION) {
        //     process.env.PRODUCTION = '0';
        // }
        // if (process.env.PRODUCTION === '0' && (!process.env.MONGO_URL || process.env.MONGO_URL === 'no')) {
        //     process.env.MONGO_URL = 'mongodb://localhost/bfast';
        // }
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
                "p": "_09LOKJdsMbbJBD-NckTpyer4Hh2D5tz7RJwDsbHAt2zjmQWeAfIA2DVZY-ftwWMA3C77yf0huM5xVfU6DsJL72WtdCCCPggyfKkMuMYfch-MFV6imt6-Fwm9gAH_-BuuToabwjBHGehV_I-Jy0D_wWdIc5hTIGZtDj5rg0cQ8k",
                "kty": "RSA",
                "q": "u6PsWuYbu9r-MpKbQyjfQIEb6hhoBAa7mZJNflMLV0fa0mNUnGOYybjwLOZUqpG5eX2XdfUkndlttZmqHMqU02p8K9qonwVzAGVVjdpVw0RPBky6TrAvAcIG8TqwpP01wFchROYUJtQhd0fW_Klj0gL0kaCNcbKvv8zPCT1omMk",
                "d": "iBgXCMsnSX5xLaX9Kzu397pRKY9DOynBfZ47aBZd-UrjCPCYTh5J17geX8oYObKNAz2jRuLsvRsLGVLNm_ACNviaYDWsU8qPkCJNnESiYt0WEfwlcayrVwsWRiErtAu4XmPLemDdiWccxvvwtwunmd7aRWh3G53_m66RoeaIUtWfJUycbFcpzf_DQwkP9r_ehUVWHFRcBpuL-JHREYI75MzlVJkvJtXza23J2dor-lQsr-V7EFb_AfMWvWW5vYxEGq91UEOREu1VrIptv7BcRfsJ8XiOswygT733O73EKbxEBSwKDMu_5sK3bmJ1r0Rccq_0aWUuzip6-hIBaf_jgQ",
                "e": "AQAB",
                "use": "sig",
                "kid": "NL46kVh-RNggYlO3t92lOcCr981DqdxKHJyDZ5DwZ2g",
                "qi": "D105pFSf0VioA3Eu3JuBgsDg7OPrBd9_ToQ5tz1M-HPNoNqvQb8SIVu6IPlDroc9qhD8uNUWIY_i3Dkj3vajD69hlCQxRVNekvuxUtrqvRs7P0NTkaqc8bRpbHG3XZXSmjdaC7V-47HJSln62bDLViSJC5BQeEGlEykVzIM8dn0",
                "dp": "C9q_sGKBnSqulC8hzpeGjRVfeq29NZ5PNKvNfjImnXBz3OGy1WHvHJELd4rCrLnaNXKvlzwws26riQk5_op3M7tG2yxSTV5QD3BvxVkcEwMTMOVXKkQxUoTc3kFEHdJq8bjL72nlpY7-Q9ognqsNa3L0R9SQWgAOhfq7RSSgslk",
                "alg": "RS256",
                "dq": "nQK6yQkZleTWpgzFPLpbrYcbi5QmnY_gtM2WaKkmqT8oHLofV8mDVPCakIefuya7M6zi60JZBHim87mEfhkJ1aqaArwyMvaFV4RzxYI4F2_2TEgx8Zw9iVQJKRu6KiTzMGH4JcX8gM0qv7vuand3Xok4iw70rHof0_eWGp43Avk",
                "n": "uyJnJwRfX6tobS4swk_KIpS-KOM0QL0L8-yVWiBz7d8hWpwBqzxRX3-6AKslhZL1aC6zGT7Z6y4jqpvdfSrXVbpgJeYtqaW32P5zpN_Rziyg6jG73E3NH3St5y6p6CujMqEfilSgoZbdsIhA_Eu_XGhlACeDUz-D3vJlhHFdY-jymaV6uTW_ojC-oQBpHuTOnUZPlgw9AeL39vuACNsX2ci94T7c8j42Wborr-jVEsxPOQoYOCBOHFNkpRlvie4oqb3o6w5Nvz3rayazRQ2NNv5kLEpw59Fl2sBWP-TInQ_gC8Kkwi_bNShjycgpNQuoHyQSH5Dz9IyIylokghiQ0Q"
            },
            rsaPublicKeyInJson: {
                "kty": "RSA",
                "e": "AQAB",
                "use": "sig",
                "kid": "NL46kVh-RNggYlO3t92lOcCr981DqdxKHJyDZ5DwZ2g",
                "alg": "RS256",
                "n": "uyJnJwRfX6tobS4swk_KIpS-KOM0QL0L8-yVWiBz7d8hWpwBqzxRX3-6AKslhZL1aC6zGT7Z6y4jqpvdfSrXVbpgJeYtqaW32P5zpN_Rziyg6jG73E3NH3St5y6p6CujMqEfilSgoZbdsIhA_Eu_XGhlACeDUz-D3vJlhHFdY-jymaV6uTW_ojC-oQBpHuTOnUZPlgw9AeL39vuACNsX2ci94T7c8j42Wborr-jVEsxPOQoYOCBOHFNkpRlvie4oqb3o6w5Nvz3rayazRQ2NNv5kLEpw59Fl2sBWP-TInQ_gC8Kkwi_bNShjycgpNQuoHyQSH5Dz9IyIylokghiQ0Q"
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
