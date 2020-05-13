import {BFast} from "bfastnode";
import {ConfigAdapter, DaaSConfig} from "../config";
import {Rest} from "../factory/Rest";

const config: ConfigAdapter = DaaSConfig.getInstance();

const rest = (config.adapters && config.adapters.rest) ?
    config.adapters.rest(config) : new Rest(config);


exports.daas = BFast.functions.onHttpRequest(DaaSConfig.getInstance().mountPath, [
    rest.verifyMethod,
    rest.verifyBodyData,
    rest.verifyApplicationId,
    rest.verifyToken,
    rest.handleRuleBlocks
]);
