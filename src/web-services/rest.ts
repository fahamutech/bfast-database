import {BFast} from "bfastnode";
import {BFastDatabaseConfig} from "../bfastDatabaseConfig";
import {getRestController} from "./webServicesConfig";

const restController = getRestController();

/**
 * rules http end-point
 */
export const bfastRulesEndpoint = BFast.functions().onPostHttpRequest(BFastDatabaseConfig.getInstance().mountPath, [
    restController.verifyMethod,
    restController.verifyBodyData,
    restController.verifyApplicationId,
    restController.verifyToken,
    restController.handleRuleBlocks
]);

