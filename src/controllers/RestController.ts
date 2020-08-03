import * as httpStatus from "http-status-codes";
import {SecurityController} from "./SecurityController";
import {RulesController} from "./RulesController";
import {BFastDatabaseConfig} from "../bfastDatabaseConfig";
import {FilesAdapter} from "../adapter/FilesAdapter";
import mime from "mime";
import {RuleResultModel} from "../model/RulesBlockModel";

let _security: SecurityController;
let _storage: FilesAdapter;

export class RestController {

    constructor(security: SecurityController, filesAdapter: FilesAdapter) {
        _security = security;
        _storage = filesAdapter;
    }

    handleGetFile(request: any, res: any, next: any) {
        const filename = request.params.filename;
        const contentType = mime.getType(filename);
        _storage.getFileData(filename).then((data) => {
            res.status(200);
            res.set('Content-Type', contentType);
            res.set('Content-Length', data.length);
            res.end(data);
        }).catch(() => {
            res.status(404);
            res.set('Content-Type', 'text/plain');
            res.end('File not found.');
        });
    }

    verifyApplicationId(request: any, response: any, next: any) {
        const applicationId = request.body.applicationId
        if (applicationId === BFastDatabaseConfig.getInstance().applicationId) {
            request.body.context = {
                applicationId
            }
            next();
        } else {
            response.status(httpStatus.UNAUTHORIZED).json({message: 'unauthorized'})
        }
    }

    verifyToken(request: any, response: any, next: any) {
        const token = request.body.token;
        const masterKey = request.body.masterKey;

        if (masterKey === BFastDatabaseConfig.getInstance().masterKey) {
            request.body.context.auth = true;
            request.body.context.uid = `masterKey_${masterKey}`;
            request.body.context.masterKey = masterKey;
            request.body.context.useMasterKey = true;
            next();
            return;
        }

        request.body.context.useMasterKey = false;
        if (!token) {
            request.body.context.auth = false;
            request.body.context.uid = null;
            next();
        } else {
            _security.verifyToken<{ uid: string }>(token).then(value => {
                request.body.context.auth = true;
                request.body.context.uid = value.uid;
                next();
            }).catch(_ => {
                response.status(httpStatus.UNAUTHORIZED).json({message: 'bad token'});
            });
        }
    }

    verifyMethod(request: any, response: any, next: any) {
        if (request.method === 'POST') {
            next();
        } else {
            response.status(403).json({message: 'HTTP method not supported'})
        }
    }

    verifyBodyData(request: any, response: any, next: any) {
        const body = request.body;
        if (!body) {
            response.status(httpStatus.BAD_REQUEST).json({message: 'require non empty rule blocks request'});
        } else if (Object.keys(body).length === 0) {
            response.status(httpStatus.BAD_REQUEST).json({message: 'require non empty rule blocks request'});
        } else {
            delete body.context;
            next();
        }
    }

    handleRuleBlocks(request: any, response: any, next: any) {
        const body = request.body;
        const results: RuleResultModel = {errors: {}};
        const rulesController = new RulesController(BFastDatabaseConfig.getInstance());
        rulesController.handleIndexesRule(body, results).then(_ => {
            return rulesController.handleAuthenticationRule(body, results);
        }).then(_ => {
            return rulesController.handleAuthorizationRule(body, results);
        }).then(_ => {
            return rulesController.handleCreateRules(body, results);
        }).then(_ => {
            return rulesController.handleUpdateRules(body, results);
        }).then(_ => {
            return rulesController.handleDeleteRules(body, results);
        }).then(_ => {
            return rulesController.handleQueryRules(body, results);
        }).then(_ => {
            return rulesController.handleTransactionRule(body, results);
        }).then(_ => {
            return rulesController.handleAggregationRules(body, results);
        }).then(_ => {
            return rulesController.handleStorageRule(body, results);
        }).then(_ => {
            if (!(results.errors && Object.keys(results.errors).length > 0)) {
                delete results.errors;
            }
            response.status(httpStatus.OK).json(results);
        }).catch(reason => {
            response.status(httpStatus.EXPECTATION_FAILED).json({message: reason.message ? reason.message : reason.toString()})
        });
    }

}
