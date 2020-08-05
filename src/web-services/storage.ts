import {BFast} from "bfastnode";
import {getRestController, getStorageController} from "./webServicesConfig";


const restController = getRestController();
const storageController = getStorageController();

/**
 * support backward parse-server files compatibility
 */
export const getFileFromStorage = BFast.functions().onGetHttpRequest('/files/:applicationId/:filename', [
    (request, _, next) => {
        request.body.applicationId = request.params.applicationId;
        next();
    },
    restController.verifyApplicationId,
    restController.verifyToken,
    restController.handleGetFile
]);

/**
 * get file uploaded to server
 */
export const getFileFromStorageV2 = BFast.functions().onGetHttpRequest('/storage/:appId/file/:filename', [
    (request, _, next) => {
        request.body.applicationId = request.params.appId;
        next();
    },
    restController.verifyApplicationId,
    restController.verifyToken,
    restController.handleGetFile
]);

/**
 * support backward parse-server files compatibility
 */
export const getFilesFromStorage = BFast.functions().onGetHttpRequest('/storage/:appId/list', [
    (request, _, next) => {
        request.body.applicationId = request.params.appId;
        next();
    },
    restController.verifyApplicationId,
    restController.verifyToken,
    restController.handleGetAllFiles
]);

export const uploadMultiPartFile = BFast.functions().onPostHttpRequest('/storage/:appId', [
    (request, response, next) => {
        request.body.applicationId = request.params.appId;
        next();
    },
    restController.verifyApplicationId,
    restController.verifyToken,
    restController.handleMultipartUpload
]);

export const onUploadMultiPartFile = BFast.functions().onGetHttpRequest('/storage/:appId',
    (request, response: any) => {
        // show a file upload form
        response.writeHead(200, {'content-type': 'text/html'});
        response.end(`
    <h2>With Node.js <code>"http"</code> module</h2>
    <form action="/storage/daas" enctype="multipart/form-data" method="post">
      <div>Text field title: <input type="text" name="title" /></div>
      <div>File: <input type="file" name="multipleFiles" multiple="multiple" /></div>
      <input type="submit" value="Upload" />
    </form>
  `);
    });
