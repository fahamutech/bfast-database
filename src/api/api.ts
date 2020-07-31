import {BFast} from "bfastnode";
import {ConfigAdapter, DaaSConfig} from "../config";
import {Database} from "../factory/Database";
import {RestController} from "../controllers/RestController";
import {SecurityController} from "../controllers/SecurityController";
import {DatabaseController} from "../controllers/DatabaseController";
import {FilesAdapter} from "../adapter/FilesAdapter";
import {S3Storage} from "../factory/S3Storage";
import {GridFsStorage} from "../factory/GridFsStorage";

const _configController: ConfigAdapter = DaaSConfig.getInstance();
const _databaseController: DatabaseController = new DatabaseController(
    (_configController && _configController.adapters && _configController.adapters.database)
        ? _configController.adapters.database(_configController)
        : new Database(),
    new SecurityController()
);
const _filesController: FilesAdapter = (_configController && _configController.adapters && _configController.adapters.s3Storage)
    ? new S3Storage(new SecurityController(), _configController)
    : new GridFsStorage(new SecurityController(), _configController.mongoDbUri);
const _restController = new RestController(new SecurityController(), _filesController);

/** handle database resources requests **/
export const daas = BFast.functions().onPostHttpRequest(DaaSConfig.getInstance().mountPath, [
    _restController.verifyMethod,
    _restController.verifyBodyData,
    _restController.verifyApplicationId,
    _restController.verifyToken,
    _restController.handleRuleBlocks
]);

/** handle files requests **/
export const getFile = BFast.functions().onGetHttpRequest('/files/:applicationId/:filename', [
    (request, _, next) => {
        request.body.applicationId = request.params.applicationId;
        next();
    },
    _restController.verifyApplicationId,
    _restController.verifyToken,
    _restController.handleGetFile
]);

/** handle socket/realtime requests **/
export const realtimeEvents = BFast.functions().onEvent('/realtimeDb', (request, response) => {
    if (!(request.body && request.body.domain && request.body.pipeline && Array.isArray(request.body.pipeline))) {
        response.emit({errors: {message: 'bad payload format'}});
        return;
    }
    const domain = request.body.domain;
    const pipeline = request.body.pipeline;
    _databaseController.changes(domain, pipeline, doc => {
        response.emit({data: doc});
    }).then(_ => {
        response.emit({info: {message: 'start listening for database changes'}});
    }).catch(reason => {
        response.emit({errors: {message: reason}});
    });
});
