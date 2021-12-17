const bfast = require("bfast");
const {config} = require("./controllers/bfast.controller");
const {initialize} = require("bfast-database-core");

bfast.init({
    applicationId: config.applicationId,
    projectId: config.projectId,
    appPassword: config.masterKey
});

bfast.init({
    applicationId: 'fahamutaarifa',
    projectId: 'fahamutaarifa'
}, 'fahamutaarifa');

// config.adapters.email = (c) => {
//     return new MailController(c);
// }
const webServices = initialize(config);

exports.rules = webServices.rest().rules;
exports.authjwk = webServices.rest().jwk;
const realtime = webServices.realtime(
    {
        applicationId: config.applicationId,
        masterKey: config.masterKey
    }
)
exports.changes = realtime.changes;

// for (const api of Object.keys(webServices.storage())) {
//     exports[api] = webServices.storage()[api];
// }
module.exports.fileUploadApi = webServices.storage().fileUploadApi;
module.exports.fileListApi = webServices.storage().fileListApi;
module.exports.fileThumbnailV2Api = webServices.storage().fileThumbnailV2Api;
module.exports.fileThumbnailApi = webServices.storage().fileThumbnailApi;
module.exports.fileV2Api = webServices.storage().fileV2Api;
module.exports.fileApi = webServices.storage().fileApi;
module.exports.getUploadFileV2 = webServices.storage().getUploadFileV2;








