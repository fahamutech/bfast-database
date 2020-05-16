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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var bcrypt = __importStar(require("bcrypt"));
var _jwt = __importStar(require("jsonwebtoken"));
var Database_1 = require("./Database");
var _jwtPassword = "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDFg6797ocIzEPK\nmk96COGGqySke+nVcJwNvuGqynxvahg6OFHamg29P9S5Ji73O1t+3uEhubv7lbaF\nf6WA1xnLzPSa3y3OdkFDUt8Px0SwnSJRxgNVG2g4gT6pA/huuJDuyleTPUKAqe/4\nTy/jbmj+dco+nTXzxo2VDB/uCGUTibPE7TvuAG3O5QbYVM2GBEPntha8L3IQ9GKc\n0r+070xbqPRL5mKokySTm6FbCT2hucL4YlOWAfkdCYJp64up8THbsMBi1e9mUgwl\n8etXcs2z0UybQSQzA4REy+3qmIIvZ3m9xLsNGAVcJ7aXkfPSajkYvvVJFXmz35Nh\nbzrJW7JZAgMBAAECggEABAX9r5CHUaePjfX8vnil129vDKa1ibKEi0cjI66CQGbB\n3ZW+HRzcQMmnFKpxdHnSEFCL93roGGThVfDWtzwqe1tOdEUtkrIX/D4Y6yJdBNf+\nlfnZoYcwZU5Er360NdUupp6akBZEX4i 878765iufiy 6c76375wi ogiyurv76\niuyo8tiutititign giufygyituugWqdE7IX/jRaOynfnn2nJl+e5ITDoBjRdMi\nyZcg4fhWMw9NGoiv21R1oBX5TibPE7TvuAG3O5QbYVM2GBEPntha8L3IQ9GKci8y\n0r+070xbqPRL5mKokySTm6FbCT2hucL4YlOWAfkdCYJp64up8THbsMBi1e9mUgwl\n8etXcs2z0UybQSQzA4REy+3qmIIvZ3m9xLsNGAVcJ7aXkfPSajkYvvVJFXmz35Nh\nbzrJW7JZAgMBAAECggEABAX9r5CHUaePjfX8vnil129vDKa1ibKEi0cjI66CQGbB\n3ZW+HRzcQMmnFKpxdHnSiruupq+MwnYoSvDv21hfCfkQDXvppQkXe72S+oS2vrJr\nJLcWQ6hFDpecIaaCJiqAXvFACr";
var database;
var Security = (function () {
    function Security(config) {
        this.config = config;
        database = (config.adapters && config.adapters.database) ?
            config.adapters.database(config) : new Database_1.Database(config);
    }
    Security.prototype.comparePassword = function (plainPassword, hashPassword) {
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, bcrypt.compare(plainPassword, hashPassword)];
                    case 1: return [2, _a.sent()];
                    case 2:
                        e_1 = _a.sent();
                        console.error(e_1);
                        throw e_1.toString();
                    case 3: return [2];
                }
            });
        });
    };
    Security.prototype.hashPlainText = function (plainText) {
        return __awaiter(this, void 0, void 0, function () {
            var e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, bcrypt.hash(plainText, 5)];
                    case 1: return [2, _a.sent()];
                    case 2:
                        e_2 = _a.sent();
                        console.error(e_2);
                        throw e_2.toString();
                    case 3: return [2];
                }
            });
        });
    };
    Security.prototype.revokeToken = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, { message: 'Token revoked', value: false }];
            });
        });
    };
    Security.prototype.generateToken = function (data, expire) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, new Promise(function (resolve, reject) {
                        _jwt.sign(data, _jwtPassword, {
                            expiresIn: expire ? expire : '7d',
                            issuer: 'bfast::cloud'
                        }, function (err, encoded) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (err) {
                                            reject({ message: 'Fails to generate a token', reason: err.toString() });
                                            return [2];
                                        }
                                        return [4, database.writeOne('_Token', {
                                                _id: data.uid,
                                                token: encoded,
                                            }, null, {
                                                bypassDomainVerification: true,
                                                indexes: [
                                                    {
                                                        field: 'token',
                                                        unique: true,
                                                    },
                                                    {
                                                        field: '_created_at',
                                                        expireAfterSeconds: Security.dayToSecond(expire)
                                                    },
                                                ]
                                            })];
                                    case 1:
                                        _a.sent();
                                        resolve(encoded);
                                        return [2];
                                }
                            });
                        }); });
                    })];
            });
        });
    };
    Security.prototype.verifyToken = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (resolve, reject) {
                        _jwt.verify(token, _jwtPassword, {
                            issuer: 'bfast::cloud'
                        }, function (err, decoded) {
                            if (err) {
                                reject({ message: 'Fails to verify token', reason: err.toString() });
                            }
                            else {
                                var data = JSON.parse(JSON.stringify(decoded));
                                if (data && data.uid) {
                                    resolve(data);
                                }
                                else {
                                    reject({ message: 'Invalid data in token' });
                                }
                            }
                        });
                    })];
            });
        });
    };
    Security.prototype.decodeToken = function (token) {
        return _jwt.decode(token, {
            complete: true,
            json: true
        });
    };
    Security.dayToSecond = function (day) {
        var days = day ? day : '7d';
        var daysInNumber = days.replace('d', '');
        return (daysInNumber * 86400);
    };
    return Security;
}());
exports.Security = Security;
