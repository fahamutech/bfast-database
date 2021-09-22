const {MailController} = require("./controllers/mail.controller");
const bfast = require("bfast");
const {WebServices, BfastDatabaseCore} = require('bfast-database-core');
const {config} = require("./controllers/bfast.controller");

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

config.adapters.email = (c) => {
    return new MailController(c);
}
const webServices = new BfastDatabaseCore().init(config);

exports.rules = webServices.rest().rules;
exports.authjwk = webServices.rest().jwk;
const realtime = webServices.realtime(
    {
        applicationId: config.applicationId,
        masterKey: config.masterKey
    }
)
exports.changes = realtime.changes;
exports.syncs = realtime.syncs;

for (const api of Object.keys(webServices.storage())) {
    exports[api] = webServices.storage()[api];
}
