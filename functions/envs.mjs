import {loadEnv} from "bfast-database-core";

const _config = {
    rsaKeyPairInJson: {},
    rsaPublicKeyInJson: {},
}
let myConfig = loadEnv();
export const config = Object.assign(myConfig, _config);
