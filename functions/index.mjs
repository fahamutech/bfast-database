import bfast from "bfast";
import {config} from "./envs.mjs";
import {initialize} from "bfast-database-core";


bfast.init({
    applicationId: config.applicationId,
    projectId: config.projectId,
    appPassword: config.masterKey
});

bfast.init({
    applicationId: 'fahamutaarifa',
    projectId: 'fahamutaarifa'
}, 'fahamutaarifa');


const webServices = initialize(config);

export const rules = webServices.rest().rules;
export const authjwk = webServices.rest().jwk;
const realtime = webServices.realtime(
    {
        applicationId: config.applicationId,
        masterKey: config.masterKey
    }
)
export const changes = realtime.changes;


export const fileUploadApi = webServices.storage().fileUploadApi;
export const fileListApi = webServices.storage().fileListApi;
export const fileThumbnailV2Api = webServices.storage().fileThumbnailV2Api;
export const fileThumbnailApi = webServices.storage().fileThumbnailApi;
export const fileV2Api = webServices.storage().fileV2Api;
export const fileApi = webServices.storage().fileApi;
export const getUploadFileV2 = webServices.storage().getUploadFileV2;








