import {RestAdapter} from "../adapter/RestAdapter";
import {NextFunction, Request, Response} from "express";
import * as httpStatus from "http-status-codes";
import {SecurityController} from "./SecurityController";
import {RulesController} from "./RulesController";
import {DaaSConfig} from "../config";
import {FilesAdapter} from "../adapter/FilesAdapter";
import mime from "mime";

let _security: SecurityController;
let _storage: FilesAdapter;

export class RestController implements RestAdapter {

    constructor(security: SecurityController,
                filesAdapter: FilesAdapter) {
        _security = security;
        _storage = filesAdapter;
    }

    handleGetFile(request: Request, res: Response, next: NextFunction) {
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

    verifyApplicationId(request: Request, response: Response, next: NextFunction) {
        const applicationId = request.body.applicationId
        if (applicationId === DaaSConfig.getInstance().applicationId) {
            request.body.context = {
                applicationId
            }
            next();
        } else {
            response.status(httpStatus.UNAUTHORIZED).json({message: 'unauthorized'})
        }
    }

    verifyToken(request: Request, response: Response, next: NextFunction) {
        const token = request.body.token;
        const masterKey = request.body.masterKey;

        if (masterKey === DaaSConfig.getInstance().masterKey) {
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

    verifyMethod(request: Request, response: Response, next: NextFunction) {
        if (request.method === 'POST') {
            next();
        } else {
            response.status(403).json({message: 'HTTP method not supported'})
        }
    }

    verifyBodyData(request: Request, response: Response, next: NextFunction) {
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

    handleRuleBlocks(request: Request, response: Response, next: NextFunction) {
        const body = request.body;
        const rules = new RulesController(DaaSConfig.getInstance());
        rules.rulesBlock = body;
        rules.handleAuthenticationRule().then(_ => {
            return rules.handleAuthorizationRule();
        }).then(_ => {
            return rules.handleCreateRules();
        }).then(_ => {
            return rules.handleUpdateRules();
        }).then(_ => {
            return rules.handleDeleteRules();
        }).then(_ => {
            return rules.handleQueryRules();
        }).then(_ => {
            return rules.handleTransactionRule();
        }).then(_ => {
            return rules.handleAggregationRules();
        }).then(_=>{
            return rules.handleStorageRule();
        }).then(_ => {
            const results = rules.results;
            if (!(results.errors && Array.isArray(results.errors) && results.errors.length > 0)) {
                delete results.errors;
            }
            response.status(httpStatus.OK).json(rules.results);
        }).catch(reason => {
            response.status(httpStatus.EXPECTATION_FAILED).json({message: reason.message ? reason.message : reason.toString()})
        });
    }

}
