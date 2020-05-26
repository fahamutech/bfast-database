import {BFast} from "bfastnode";
import {ConfigAdapter, DaaSConfig} from "../config";
import {Database} from "../factory/Database";
import {RestController} from "../controllers/RestController";
import {SecurityController} from "../controllers/SecurityController";
import {DatabaseController} from "../controllers/DatabaseController";

const config: ConfigAdapter = DaaSConfig.getInstance();

const database: DatabaseController = new DatabaseController(
    (config && config.adapters && config.adapters.database)
        ? config.adapters.database(config)
        : new Database(),
    new SecurityController()
)

const rest = new RestController(new SecurityController());

exports.daas = BFast.functions().onPostHttpRequest(DaaSConfig.getInstance().mountPath, [
    rest.verifyMethod,
    rest.verifyBodyData,
    rest.verifyApplicationId,
    rest.verifyToken,
    rest.handleRuleBlocks
]);

// support backward parse-server files compatibility
exports.getFile = BFast.functions().onGetHttpRequest('/files/:applicationId/:filename', [
    rest.verifyBodyData,
    (request, _, next) => {
        request.body.applicationId = request.params.applicationId;
        next();
    },
    rest.verifyApplicationId,
    rest.verifyToken,
    rest.storage
]);

exports.realtimeEvents = BFast.functions().onEvent('realtimeDb', data => {
    const {payload, socket, auth} = data;
    if (!(payload && payload.domain && payload.pipeline && Array.isArray(payload.pipeline))) {
        socket.emit('realtimeDb', {errors: {message: 'bad payload format'}});
        return;
    }
    const domain = payload.domain;
    const pipeline = payload.pipeline;
    database.changes(domain, pipeline, doc => {
        socket.emit('realtimeDb', {data: doc});
    }).then(_ => {
        socket.emit('realtimeDb', {info: {message: 'start listening for database changes'}});
    }).catch(reason => {
        socket.emit('realtimeDb', {errors: {message: reason}});
    });
});
