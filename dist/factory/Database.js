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
var mongodb_1 = require("mongodb");
var config_1 = require("../config");
var Database = (function () {
    function Database(config) {
        this.config = config;
    }
    Database.prototype.sanitize4Db = function (data) {
        if (data.return) {
            delete data.return;
        }
        if (data && data.id) {
            data._id = data.id;
            delete data.id;
        }
        if (data && data.createdAt) {
            data._created_at = data.createdAt;
            delete data.createdAt;
        }
        if (data && data.updatedAt) {
            data._updated_at = data.updatedAt;
            delete data.updatedAt;
        }
        if (data && data.createdBy) {
            data._created_by = data.createdBy;
            delete data.createdBy;
        }
        return data;
    };
    Database.prototype.sanitizeQueryData4Db = function (data) {
    };
    Database.prototype.sanitize4User = function (data, returnFields) {
        if (data && data._id !== undefined) {
            data.id = data._id.toString();
            delete data._id;
        }
        if (data && data._created_at !== undefined) {
            data.createdAt = data._created_at;
            delete data._created_at;
        }
        if (data && data._updated_at !== undefined) {
            data.updatedAt = data._updated_at;
            delete data._updated_at;
        }
        if (data && data._created_by !== undefined) {
            data.createdBy = data._created_by;
            delete data._created_by;
        }
        var returnedData = {};
        if (!returnFields) {
            returnedData.id = data.id;
            return returnedData;
        }
        else if (returnFields && Array.isArray(returnFields) && returnFields.length === 0) {
            return data;
        }
        else {
            returnFields.forEach(function (value) {
                returnedData[value] = data[value];
            });
            returnedData.id = data.id;
            return returnedData;
        }
    };
    Database.prototype.writeMany = function (domain, data, context, options) {
        return __awaiter(this, void 0, void 0, function () {
            var returnFieldsMap, conn, sanitizedData, freshData, response;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!(options === null || options === void 0 ? void 0 : options.bypassDomainVerification)) return [3, 2];
                        return [4, this.handleDomainValidation(domain)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4, this.handleIndexesCreation(domain, options)];
                    case 3:
                        _a.sent();
                        returnFieldsMap = {};
                        data.forEach(function (value, index) {
                            returnFieldsMap[index] = value.return;
                        });
                        return [4, this.connection()];
                    case 4:
                        conn = _a.sent();
                        sanitizedData = data.map(function (value) { return _this.sanitize4Db(value); });
                        freshData = sanitizedData.map(function (value) { return _this.addCreateMetadata(value, context); });
                        return [4, conn.db().collection(domain).insertMany(freshData)];
                    case 5:
                        response = _a.sent();
                        Object.keys(response.insertedIds).forEach(function (index) {
                            freshData[index]._id = response.insertedIds[index];
                            freshData[index] = _this.sanitize4User(freshData[index], returnFieldsMap[index]);
                        });
                        return [2, freshData];
                }
            });
        });
    };
    Database.prototype.writeOne = function (domain, data, context, options) {
        return __awaiter(this, void 0, void 0, function () {
            var returnFields, sanitizedData, freshData, conn, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!(options === null || options === void 0 ? void 0 : options.bypassDomainVerification)) return [3, 2];
                        return [4, this.handleDomainValidation(domain)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4, this.handleIndexesCreation(domain, options)];
                    case 3:
                        _a.sent();
                        returnFields = data.return;
                        sanitizedData = this.sanitize4Db(data);
                        freshData = this.addCreateMetadata(sanitizedData, context);
                        return [4, this.connection()];
                    case 4:
                        conn = _a.sent();
                        return [4, conn.db().collection(domain).insertOne(freshData)];
                    case 5:
                        response = _a.sent();
                        freshData._id = response.insertedId;
                        return [2, this.sanitize4User(freshData, returnFields)];
                }
            });
        });
    };
    Database.prototype.connection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var mongoUri;
            return __generator(this, function (_a) {
                if (this._mongoClient && this._mongoClient.isConnected()) {
                    return [2, this._mongoClient];
                }
                else {
                    mongoUri = config_1.DaaSConfig.getInstance().mongoDbUri;
                    return [2, new mongodb_1.MongoClient(mongoUri, {
                            useNewUrlParser: true,
                            useUnifiedTopology: true
                        }).connect()];
                }
                return [2];
            });
        });
    };
    Database.prototype.init = function () {
        return Promise.resolve();
    };
    Database.prototype.addCreateMetadata = function (data, context) {
        data._created_by = context === null || context === void 0 ? void 0 : context.uid;
        data._created_at = new Date();
        data._updated_at = new Date();
        return data;
    };
    Database.prototype.addUpdateMetadata = function (data, context) {
        data['$currentDate'] = { _updated_at: true };
        return data;
    };
    Database.prototype.validDomain = function (domain) {
        return (domain !== '_User' && domain !== '_Token');
    };
    Database.prototype.handleDomainValidation = function (domain) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.validDomain(domain)) {
                    throw {
                        message: domain + " is not a valid domain name"
                    };
                }
                return [2];
            });
        });
    };
    Database.prototype.handleIndexesCreation = function (domain, options) {
        return __awaiter(this, void 0, void 0, function () {
            var conn, _i, _a, value, indexOptions;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!(options && options.indexes && Array.isArray(options.indexes))) return [3, 6];
                        return [4, this.connection()];
                    case 1:
                        conn = _c.sent();
                        _i = 0, _a = options.indexes;
                        _c.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3, 5];
                        value = _a[_i];
                        indexOptions = {};
                        Object.assign(indexOptions, value);
                        delete indexOptions.field;
                        return [4, conn.db().collection(domain).createIndex((_b = {}, _b[value.field] = 1, _b), indexOptions)];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3, 2];
                    case 5: return [2];
                    case 6: return [2];
                }
            });
        });
    };
    Database.prototype.query = function (domain, queryModel, context, options) {
        return __awaiter(this, void 0, void 0, function () {
            var conn, result, query_1, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!(options === null || options === void 0 ? void 0 : options.bypassDomainVerification)) return [3, 2];
                        return [4, this.handleDomainValidation(domain)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4, this.connection()];
                    case 3:
                        conn = _a.sent();
                        if (!queryModel.id) return [3, 5];
                        return [4, conn.db().collection(domain).findOne({ _id: queryModel.id })];
                    case 4:
                        result = _a.sent();
                        return [2, this.sanitize4User(result, queryModel.return)];
                    case 5:
                        query_1 = conn.db().collection(domain).find(queryModel.filter);
                        if (queryModel.skip) {
                            query_1.skip(queryModel.skip);
                        }
                        if (queryModel.size) {
                            query_1.limit(queryModel.size);
                        }
                        if (queryModel.orderBy && Array.isArray(queryModel.orderBy) && queryModel.orderBy.length > 0) {
                            queryModel.orderBy.forEach(function (value) {
                                query_1.sort(value);
                            });
                        }
                        return [4, query_1.toArray()];
                    case 6:
                        result = _a.sent();
                        return [2, result.map(function (value) { return _this.sanitize4User(value, queryModel.return); })];
                }
            });
        });
    };
    Database.prototype.updateOne = function (domain, updateModel, context, options) {
        return __awaiter(this, void 0, void 0, function () {
            var returnFields, sanitizedData, freshData, conn, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!(options === null || options === void 0 ? void 0 : options.bypassDomainVerification)) return [3, 2];
                        return [4, this.handleDomainValidation(domain)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4, this.handleIndexesCreation(domain, options)];
                    case 3:
                        _a.sent();
                        returnFields = updateModel.return;
                        sanitizedData = this.sanitize4Db(updateModel.update);
                        freshData = this.addUpdateMetadata(sanitizedData, context);
                        return [4, this.connection()];
                    case 4:
                        conn = _a.sent();
                        return [4, conn.db().collection(domain).updateOne(updateModel.filter, freshData, {
                                upsert: updateModel.upsert === true ? updateModel.upsert : false
                            })];
                    case 5:
                        response = _a.sent();
                        return [2, response.result];
                }
            });
        });
    };
    Database.prototype.updateMany = function (domain, updateModel, context, options) {
        return __awaiter(this, void 0, void 0, function () {
            var returnFields, sanitizedData, freshData, conn, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!(options === null || options === void 0 ? void 0 : options.bypassDomainVerification)) return [3, 2];
                        return [4, this.handleDomainValidation(domain)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4, this.handleIndexesCreation(domain, options)];
                    case 3:
                        _a.sent();
                        returnFields = updateModel.return;
                        sanitizedData = this.sanitize4Db(updateModel.update);
                        freshData = this.addUpdateMetadata(sanitizedData, context);
                        return [4, this.connection()];
                    case 4:
                        conn = _a.sent();
                        return [4, conn.db().collection(domain).updateMany(updateModel.filter, freshData, {
                                upsert: updateModel.upsert === true ? updateModel.upsert : false
                            })];
                    case 5:
                        response = _a.sent();
                        return [2, response.result];
                }
            });
        });
    };
    return Database;
}());
exports.Database = Database;
