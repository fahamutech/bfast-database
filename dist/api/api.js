"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bfastnode_1 = require("bfastnode");
var config_1 = require("../config");
var Rest_1 = require("../factory/Rest");
var config = config_1.DaaSConfig.getInstance();
var rest = (config.adapters && config.adapters.rest) ?
    config.adapters.rest(config) : new Rest_1.Rest(config);
exports.daas = bfastnode_1.BFast.functions.onHttpRequest(config_1.DaaSConfig.getInstance().mountPath, [
    rest.verifyMethod,
    rest.verifyBodyData,
    rest.verifyApplicationId,
    rest.verifyToken,
    rest.handleRuleBlocks
]);
