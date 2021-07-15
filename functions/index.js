const {MailController} = require("./controllers/mail.controller");
const {bfast} = require("bfastnode");
const {BfastController} = require("./controllers/bfast.controller");
const {WebServices, BfastDatabaseCore} = require('bfast-database-core');
const bfastController = new BfastController();

const config = bfastController.getBFastDatabaseConfigs();
// console.log(config);
bfast.init({
    applicationId: config.applicationId,
    projectId: config.projectId,
    appPassword: config.masterKey
});

bfast.init({
    applicationId: 'fahamutaarifa',
    projectId: 'fahamutaarifa'
}, 'fahamutaarifa');

/**
 *
 * @type {WebServices}
 */
const webServices = new BfastDatabaseCore().init({
    applicationId: config.applicationId,
    projectId: config.projectId,
    logs: config.logs,
    masterKey: config.masterKey,
    mongoDbUri: config.mongoDbUri,
    rsaKeyPairInJson: config.rsaKeyPairInJson,
    rsaPublicKeyInJson: config.rsaPublicKeyInJson,
    port: config.port,
    adapters: {
        s3Storage: config.adapters.s3Storage,
        email: config1 => {
            return new MailController(config1);
        }
    }
});

exports.rules = webServices.rest().rules;
exports.authjwk = webServices.rest().jwk;

exports.changes = webServices.realtime(
    {
        applicationId: config.applicationId,
        masterKey: config.masterKey
    }
).changes;

for (const api of Object.keys(webServices.storage())) {
    exports[api] = webServices.storage()[api];
}
