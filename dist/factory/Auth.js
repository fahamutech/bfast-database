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
var Security_1 = require("./Security");
var Email_1 = require("./Email");
var database;
var security;
var emailAdapter;
var Auth = (function () {
    function Auth(config) {
        this.config = config;
        this.domainName = '_User';
        database = (config.adapters && config.adapters.database) ?
            config.adapters.database(config) : new Database_1.Database(config);
        security = (config.adapters && config.adapters.security) ?
            config.adapters.security(config) : new Security_1.Security(config);
        emailAdapter = (config.adapters && config.adapters.email) ?
            config.adapters.email(config) : new Email_1.Email(config);
    }
    Auth.prototype.resetPassword = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!email) {
                    throw new Error('Email required');
                }
                throw new Error('Not implemented');
            });
        });
    };
    Auth.prototype.signIn = function (userModel, context) {
        return __awaiter(this, void 0, void 0, function () {
            var users, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Auth.validateData(userModel, true);
                        userModel.return = [];
                        return [4, database.query(this.domainName, {
                                filter: {
                                    username: userModel.username
                                },
                                return: []
                            }, context, {
                                bypassDomainVerification: true
                            })];
                    case 1:
                        users = _a.sent();
                        if (!(users && Array.isArray(users) && users.length == 1)) return [3, 3];
                        user = users[0];
                        return [4, security.comparePassword(userModel.password, user.password)];
                    case 2:
                        if (_a.sent()) {
                            delete user.password;
                            user.token = security.generateToken({ uid: user.id });
                            return [2, user];
                        }
                        else {
                            throw new Error("Username/Password is not valid");
                        }
                        return [3, 4];
                    case 3: throw new Error("Username/Password is not valid");
                    case 4: return [2];
                }
            });
        });
    };
    Auth.prototype.signUp = function (userModel, context) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, user, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        Auth.validateData(userModel);
                        userModel.return = [];
                        _a = userModel;
                        return [4, security.hashPlainText(userModel.password)];
                    case 1:
                        _a.password = _c.sent();
                        return [4, database.writeOne(this.domainName, userModel, context, {
                                bypassDomainVerification: true,
                                indexes: [
                                    {
                                        field: 'email',
                                        unique: true,
                                        collation: {
                                            locale: 'en',
                                            strength: 2
                                        }
                                    },
                                    {
                                        field: 'username',
                                        unique: true,
                                        collation: {
                                            locale: 'en',
                                            strength: 2
                                        }
                                    }
                                ]
                            })];
                    case 2:
                        user = _c.sent();
                        delete user.password;
                        _b = user;
                        return [4, security.generateToken({ uid: user.id })];
                    case 3:
                        _b.token = _c.sent();
                        return [2, user];
                }
            });
        });
    };
    Auth.validateData = function (data, skipEmail) {
        if (skipEmail === void 0) { skipEmail = false; }
        if (!data.username) {
            throw new Error('username required');
        }
        else if (!data.password) {
            throw new Error('Password required');
        }
        else if (!data.email && !skipEmail) {
            throw new Error('Email required');
        }
        else {
            return;
        }
    };
    return Auth;
}());
exports.Auth = Auth;
