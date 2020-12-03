const {BfastController} = require("./controllers/bfast.controller");
const {WebServices, Provider} = require('bfast-database-core');
const bfastController = new BfastController();


bfastController.initServices();

async function start() {
    await bfastController.startDatabaseEngine();
    await bfastController.initiateBFastClients();
}

const webServices = new WebServices(
    Provider.get(Provider.names.REST_WEB_SERVICE),
    Provider.get(Provider.names.REALTIME_WEB_SERVICE),
    Provider.get(Provider.names.STORAGE_WEB_SERVICE)
);

exports.rules = webServices.rest().rules;

exports.changes = webServices.realtime(
    {
        applicationId: bfastController.getBFastDatabaseConfigs().applicationId,
        masterKey: bfastController.getBFastDatabaseConfigs().masterKey
    }
).changes;

for (const api of Object.keys(webServices.storage())) {
    exports[api] = webServices.storage()[api];
}

start().catch(console.log);
