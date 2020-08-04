import {BFast} from "bfastnode";
import {getRestController, getStorageController} from "./webServicesConfig";
import {BAD_REQUEST, OK} from 'http-status-codes';

const formidable = require('formidable');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);


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


export const uploadMultiPartFile = BFast.functions().onPostHttpRequest('/storage', [
    (request, response, next) => {
        request.body.applicationId = request.query.appId;
        next();
    },
    restController.verifyApplicationId,
    restController.verifyToken,
    (request, response: any) => {
        const form = formidable({
            multiples: true,
            // uploadDir: __dirname,
            maxFileSize: 10 * 1024 * 1024 * 1024,
            keepExtensions: true
        });
        form.parse(request, async (err, fields, files) => {
            try {
                if (err) {
                    response.status(BAD_REQUEST).send(err.toString());
                    return;
                }
                const filesKeys = Object.keys(files);
                const urls = []
                for (const key of filesKeys) {
                    const extension = files[key].path.split('.')[1];
                    const fileBuffer = await readFile(files[key].path);
                    const result = await storageController.saveFromBuffer({
                        data: fileBuffer,
                        type: files[key].type,
                        filename: `upload.${extension}`
                    }, request.body.context);
                    urls.push(result);
                }
                response.status(OK).json({urls});
            } catch (e) {
                console.log(e);
                response.status(BAD_REQUEST).end(e.toString());
            }
        });
        return;
    }
]);

export const onUploadMultiPartFile = BFast.functions().onGetHttpRequest('/storage',
    (request, response: any) => {
        // show a file upload form
        response.writeHead(200, {'content-type': 'text/html'});
        response.end(`
    <h2>With Node.js <code>"http"</code> module</h2>
    <form action="/storage?appId=daas" enctype="multipart/form-data" method="post">
      <div>Text field title: <input type="text" name="title" /></div>
      <div>File: <input type="file" name="multipleFiles" multiple="multiple" /></div>
      <input type="submit" value="Upload" />
    </form>
  `);
    });
