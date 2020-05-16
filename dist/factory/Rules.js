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
var Database_1 = require("./Database");
var Auth_1 = require("./Auth");
var database;
var auth;
var Rules = (function () {
    function Rules(config) {
        this.config = config;
        this.results = { errors: [] };
        database = (config.adapters && config.adapters.database) ?
            this.config.adapters.database(config) : new Database_1.Database(config);
        auth = (config.adapters && config.adapters.auth) ?
            this.config.adapters.auth(config) : new Auth_1.Auth(config);
    }
    Rules.prototype.getRulesKey = function () {
        if (this.rulesBlock) {
            return Object.keys(this.rulesBlock);
        }
        else {
            return Object.keys({});
        }
    };
    Rules.prototype.handleAuthenticationRule = function () {
        return __awaiter(this, void 0, void 0, function () {
            var authenticationRules, authenticationRule, authentication, _i, _a, action, _b, _c, _d, e_1, e_2;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 12, , 13]);
                        authenticationRules = this.getRulesKey().filter(function (rule) { return rule.startsWith('Authentication'); });
                        if (authenticationRules.length === 0) {
                            return [2];
                        }
                        authenticationRule = authenticationRules[0];
                        authentication = this.rulesBlock[authenticationRule];
                        _i = 0, _a = Object.keys(authentication);
                        _e.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3, 11];
                        action = _a[_i];
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 9, , 10]);
                        if (!(action === 'signUp')) return [3, 4];
                        this.results["Authentication"] = {};
                        _b = this.results["Authentication"];
                        return [4, auth.signUp(authentication[action], this.rulesBlock.context)];
                    case 3:
                        _b.signUp = _e.sent();
                        _e.label = 4;
                    case 4:
                        if (!(action === 'signIn')) return [3, 6];
                        this.results["Authentication"] = {};
                        _c = this.results["Authentication"];
                        return [4, auth.signIn(authentication[action], this.rulesBlock.context)];
                    case 5:
                        _c.signIn = _e.sent();
                        _e.label = 6;
                    case 6:
                        if (!(action === 'resetPassword')) return [3, 8];
                        this.results["Authentication"] = {};
                        _d = this.results["Authentication"];
                        return [4, auth.resetPassword(authentication[action].email)];
                    case 7:
                        _d.resetPassword = _e.sent();
                        _e.label = 8;
                    case 8: return [3, 10];
                    case 9:
                        e_1 = _e.sent();
                        this.results.errors.push({
                            message: e_1.message ? e_1.message : e_1.toString(),
                            path: "Authentication." + action,
                        });
                        return [3, 10];
                    case 10:
                        _i++;
                        return [3, 1];
                    case 11: return [2];
                    case 12:
                        e_2 = _e.sent();
                        this.results.errors.push({
                            message: e_2.message ? e_2.message : e_2.toString(),
                            path: 'Authentication'
                        });
                        return [2];
                    case 13: return [2];
                }
            });
        });
    };
    Rules.prototype.handleAuthorizationRule = function () {
        return;
    };
    Rules.prototype.handleCreateRules = function () {
        return __awaiter(this, void 0, void 0, function () {
            var createRules, _i, createRules_1, createRule, domain, data, _a, _b, _c, _d, e_3, e_4;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 10, , 11]);
                        createRules = this.getRulesKey().filter(function (rule) { return rule.startsWith('Create'); });
                        if (createRules.length === 0) {
                            return [2];
                        }
                        _i = 0, createRules_1 = createRules;
                        _e.label = 1;
                    case 1:
                        if (!(_i < createRules_1.length)) return [3, 9];
                        createRule = createRules_1[_i];
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 7, , 8]);
                        domain = this.extractDomain(createRule, 'Create');
                        data = this.rulesBlock[createRule];
                        if (!(data && Array.isArray(data))) return [3, 4];
                        _a = this.results;
                        _b = domain;
                        return [4, database.writeMany(domain, data, this.rulesBlock.context, {
                                bypassDomainVerification: !!this.rulesBlock.context.masterKey
                            })];
                    case 3:
                        _a[_b] = _e.sent();
                        return [3, 6];
                    case 4:
                        _c = this.results;
                        _d = domain;
                        return [4, database.writeOne(domain, data, this.rulesBlock.context, {
                                bypassDomainVerification: !!this.rulesBlock.context.masterKey
                            })];
                    case 5:
                        _c[_d] = _e.sent();
                        _e.label = 6;
                    case 6: return [3, 8];
                    case 7:
                        e_3 = _e.sent();
                        this.results.errors.push({
                            message: e_3.message ? e_3.message : e_3.toString(),
                            path: createRule
                        });
                        return [3, 8];
                    case 8:
                        _i++;
                        return [3, 1];
                    case 9: return [2];
                    case 10:
                        e_4 = _e.sent();
                        this.results.errors.push({
                            message: e_4.message ? e_4.message : e_4.toString(),
                            path: 'Create'
                        });
                        return [2];
                    case 11: return [2];
                }
            });
        });
    };
    Rules.prototype.handleDeleteRules = function () {
        return;
    };
    Rules.prototype.handleQueryRules = function () {
        return __awaiter(this, void 0, void 0, function () {
            var queryRules, _i, queryRules_1, queryRule, domain, data, _a, _b, e_5, e_6;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 9, , 10]);
                        queryRules = this.getRulesKey().filter(function (rule) { return rule.startsWith('Query'); });
                        if (queryRules.length === 0) {
                            return [2];
                        }
                        _i = 0, queryRules_1 = queryRules;
                        _c.label = 1;
                    case 1:
                        if (!(_i < queryRules_1.length)) return [3, 8];
                        queryRule = queryRules_1[_i];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 6, , 7]);
                        domain = this.extractDomain(queryRule, 'Query');
                        data = this.rulesBlock[queryRule];
                        if (!(data && Array.isArray(data))) return [3, 3];
                        this.results.errors.push({
                            message: 'Query data must be a map',
                            path: queryRule
                        });
                        return [3, 5];
                    case 3:
                        _a = this.results;
                        _b = domain;
                        return [4, database.query(domain, data, this.rulesBlock.context, {
                                bypassDomainVerification: !!this.rulesBlock.context.masterKey
                            })];
                    case 4:
                        _a[_b] = _c.sent();
                        _c.label = 5;
                    case 5: return [3, 7];
                    case 6:
                        e_5 = _c.sent();
                        this.results.errors.push({
                            message: e_5.message ? e_5.message : e_5.toString(),
                            path: queryRule
                        });
                        return [3, 7];
                    case 7:
                        _i++;
                        return [3, 1];
                    case 8: return [2];
                    case 9:
                        e_6 = _c.sent();
                        this.results.errors.push({
                            message: e_6.message ? e_6.message : e_6.toString(),
                            path: 'Query'
                        });
                        return [2];
                    case 10: return [2];
                }
            });
        });
    };
    Rules.prototype.handleTransactionRule = function () {
        return;
    };
    Rules.prototype.handleUpdateRules = function () {
        return __awaiter(this, void 0, void 0, function () {
            var updateRules, _i, updateRules_1, updateRule, domain, data, filter, _a, _b, _c, _d, e_7, e_8;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 10, , 11]);
                        updateRules = this.getRulesKey().filter(function (rule) { return rule.startsWith('Update'); });
                        if (updateRules.length === 0) {
                            return [2];
                        }
                        _i = 0, updateRules_1 = updateRules;
                        _e.label = 1;
                    case 1:
                        if (!(_i < updateRules_1.length)) return [3, 9];
                        updateRule = updateRules_1[_i];
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 7, , 8]);
                        domain = this.extractDomain(updateRule, 'Update');
                        data = this.rulesBlock[updateRule];
                        if (!data.id) return [3, 4];
                        filter = {};
                        delete data.filter;
                        filter['_id'] = data.id;
                        data.filter = filter;
                        _a = this.results;
                        _b = domain;
                        return [4, database.updateOne(domain, data, this.rulesBlock.context, {
                                bypassDomainVerification: !!this.rulesBlock.context.masterKey
                            })];
                    case 3:
                        _a[_b] = _e.sent();
                        return [3, 6];
                    case 4:
                        _c = this.results;
                        _d = domain;
                        return [4, database.updateMany(domain, data, this.rulesBlock.context, {
                                bypassDomainVerification: !!this.rulesBlock.context.masterKey
                            })];
                    case 5:
                        _c[_d] = _e.sent();
                        _e.label = 6;
                    case 6: return [3, 8];
                    case 7:
                        e_7 = _e.sent();
                        this.results.errors.push({
                            message: e_7.message ? e_7.message : e_7.toString(),
                            path: updateRule
                        });
                        return [3, 8];
                    case 8:
                        _i++;
                        return [3, 1];
                    case 9: return [2];
                    case 10:
                        e_8 = _e.sent();
                        this.results.errors.push({
                            message: e_8.message ? e_8.message : e_8.toString(),
                            path: 'Update'
                        });
                        return [2];
                    case 11: return [2];
                }
            });
        });
    };
    Rules.prototype.extractDomain = function (rule, remove) {
        return rule.replace(remove, '');
    };
    return Rules;
}());
exports.Rules = Rules;
