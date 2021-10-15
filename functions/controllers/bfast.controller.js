const {loadEnv, getEnv} = require("bfast-database-core");
const _config = {
    rsaKeyPairInJson: {},
    rsaPublicKeyInJson: {},
    taarifaToken: getEnv(process.env.TAARIFA_TOKEN) ?
        getEnv(process.env.TAARIFA_TOKEN) :
        'fzJogB87b8D3gTxU0u6utUx4CELiI24M7LSJMmfVZE7bjFmb2guNIcsiktQQPB8',
}
let myConfig = loadEnv();
module.exports.config = Object.assign(myConfig, _config);
