import {BFast} from "bfastnode";
import {ConfigAdapter, DaaSConfig} from "../utils/config";
import {Rest} from "../factory/Rest";
import {DatabaseAdapter} from "../adapter/DatabaseAdapter";
import {Database} from "../factory/Database";

const config: ConfigAdapter = DaaSConfig.getInstance();

const database: DatabaseAdapter = (config.adapters && config.adapters.database)
    ? config.adapters.database(config) : new Database(config);

const rest = (config.adapters && config.adapters.rest)
    ? config.adapters.rest(config) : new Rest(config);


exports.daas = BFast.functions().onPostHttpRequest(DaaSConfig.getInstance().mountPath, [
    rest.verifyMethod,
    rest.verifyBodyData,
    rest.verifyApplicationId,
    rest.verifyToken,
    rest.handleRuleBlocks
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
