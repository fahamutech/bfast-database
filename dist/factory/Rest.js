"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("../config");
var httpStatus = __importStar(require("http-status-codes"));
var Security_1 = require("./Security");
var Rules_1 = require("./Rules");
var security;
var _config;
var Rest = (function () {
    function Rest(config) {
        this.config = config;
        _config = this.config;
        security = (_config.adapters && _config.adapters.security) ?
            _config.adapters.security(_config) : new Security_1.Security(_config);
    }
    Rest.prototype.verifyApplicationId = function (request, response, next) {
        var applicationId = request.body.applicationId;
        if (applicationId === config_1.DaaSConfig.getInstance().applicationId) {
            request.body.context = {
                applicationId: applicationId
            };
            next();
        }
        else {
            response.status(httpStatus.UNAUTHORIZED).json({ message: 'unauthorized' });
        }
    };
    Rest.prototype.verifyToken = function (request, response, next) {
        var token = request.body.token;
        var masterKey = request.body.masterKey;
        if (masterKey === config_1.DaaSConfig.getInstance().masterKey) {
            request.body.context.auth = null;
            request.body.context.uid = null;
            request.body.context.masterKey = masterKey;
            next();
            return;
        }
        if (!token) {
            request.body.context.auth = null;
            request.body.context.uid = null;
            next();
        }
        else {
            security.verifyToken(token).then(function (value) {
                request.body.context.auth = true;
                request.body.context.uid = value.uid;
                next();
            }).catch(function (_) {
                response.status(httpStatus.UNAUTHORIZED).json({ message: 'bad token' });
            });
        }
    };
    Rest.prototype.verifyMethod = function (request, response, next) {
        if (request.method === 'POST') {
            next();
        }
        else {
            response.status(403).json({ message: 'HTTP method not supported' });
        }
    };
    Rest.prototype.verifyBodyData = function (request, response, next) {
        var body = request.body;
        if (!body) {
            response.status(httpStatus.BAD_REQUEST).json({ message: 'require non empty request' });
        }
        else if (Object.keys(body).length === 0) {
            response.status(httpStatus.BAD_REQUEST).json({ message: 'require non empty request' });
        }
        else {
            delete body.context;
            next();
        }
    };
    Rest.prototype.handleRuleBlocks = function (request, response, next) {
        var body = request.body;
        var rules = (_config.adapters && _config.adapters.rules) ?
            _config.adapters.rules(_config) : new Rules_1.Rules(_config);
        rules.rulesBlock = body;
        Promise.all([
            rules.handleCreateRules(),
            rules.handleQueryRules(),
            rules.handleUpdateRules(),
            rules.handleDeleteRules(),
            rules.handleTransactionRule(),
            rules.handleAuthenticationRule(),
            rules.handleAuthorizationRule()
        ]).then(function (_) {
            var results = rules.results;
            if (!(results.errors && Array.isArray(results.errors) && results.errors.length > 0)) {
                delete results.errors;
            }
            response.status(httpStatus.OK).json(rules.results);
        }).catch(function (reason) {
            response.status(httpStatus.EXPECTATION_FAILED).json({ message: reason.message ? reason.message : reason });
        });
    };
    return Rest;
}());
exports.Rest = Rest;
