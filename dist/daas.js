"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var bfast_faas_1 = require("bfast-faas");
var config_1 = require("./config");
var Database_1 = require("./factory/Database");
var DaaSServer = (function () {
    function DaaSServer(config) {
        this.config = config;
        DaaSServer.registerOptions(config);
    }
    DaaSServer.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.validateOptions().valid) return [3, 3];
                        this.faas = new bfast_faas_1.FaaS({
                            port: this.config.port,
                            functionsConfig: {
                                functionsDirPath: __dirname,
                                bfastJsonPath: __dirname + '/config/bfast.json'
                            }
                        });
                        return [4, this.faas.start()];
                    case 1:
                        _a.sent();
                        return [4, DaaSServer.setUpDatabase(this.config)];
                    case 2:
                        _a.sent();
                        return [2, true];
                    case 3: throw new Error(this.validateOptions().message);
                }
            });
        });
    };
    DaaSServer.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                process.exit(0);
                return [2, true];
            });
        });
    };
    DaaSServer.prototype.validateOptions = function () {
        var _a;
        var options = this.config;
        if (!options.port) {
            return {
                valid: false,
                message: 'Port option required'
            };
        }
        else if (!options.mountPath) {
            return {
                valid: false,
                message: 'Mount Path required'
            };
        }
        else if (!options.masterKey) {
            return {
                valid: false,
                message: 'MasterKey required'
            };
        }
        else {
            if (!options.mongoDbUri) {
                if (!options.adapters && !((_a = options.adapters) === null || _a === void 0 ? void 0 : _a.database)) {
                    return {
                        valid: false,
                        message: 'mongoDbUri required, or supply database adapter instead'
                    };
                }
            }
            return {
                valid: true,
                message: 'no issues'
            };
        }
    };
    DaaSServer.setUpDatabase = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var database;
            return __generator(this, function (_a) {
                database = (config.adapters && config.adapters.database) ?
                    config.adapters.database(config) : new Database_1.Database(config);
                return [2, database.init()];
            });
        });
    };
    DaaSServer.registerOptions = function (options) {
        config_1.DaaSConfig.getInstance().addValues(options);
    };
    return DaaSServer;
}());
exports.DaaSServer = DaaSServer;
