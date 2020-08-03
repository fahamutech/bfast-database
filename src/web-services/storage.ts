import {BFast} from "bfastnode";
import {getRestController} from "./webServicesConfig";
import {BAD_REQUEST} from 'http-status-codes';

const formidable = require('formidable');


const restController = getRestController();

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


export const uploadMultiPartFile = BFast.functions().onPostHttpRequest('/storage',
    (request, response: any) => {
        const form = formidable({
            multiples: true,
            uploadDir: __dirname,
            maxFileSize: 10 * 1024 * 1024 * 1024,

            keepExtensions: true
        });
        form.parse(request, (err, fields, files) => {
            if (err) {
                response.status(BAD_REQUEST).send(err.toString());
                console.log(err);
                return;
            }
            console.log(fields);
            console.log(files);
            response.writeHead(200, {'content-type': 'application/json'});
            response.end(JSON.stringify({fields, files}, null, 2));
        });
        return;
    });

export const onUploadMultiPartFile = BFast.functions().onGetHttpRequest('/storage',
    (request, response: any) => {
        // show a file upload form
        response.writeHead(200, {'content-type': 'text/html'});
        response.end(`
    <h2>With Node.js <code>"http"</code> module</h2>
    <form action="/storage" enctype="multipart/form-data" method="post">
      <div>Text field title: <input type="text" name="title" /></div>
      <div>File: <input type="file" name="multipleFiles" multiple="multiple" /></div>
      <input type="submit" value="Upload" />
    </form>
  `);
    });
