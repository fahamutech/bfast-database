import {RestAdapter} from "../adapter/RestAdapter";
import {NextFunction, Request, Response} from "express";
import {ConfigAdapter, DaaSConfig} from "../utils/config";
import * as httpStatus from "http-status-codes";
import {SecurityAdapter} from "../adapter/SecurityAdapter";
import {Security} from "./Security";
import {Rules} from "./Rules";

let security: SecurityAdapter;
let _config: ConfigAdapter;

export class Rest implements RestAdapter {
    constructor(private readonly config: ConfigAdapter) {
        _config = this.config;
        security = (_config.adapters && _config.adapters.security) ?
            _config.adapters.security(_config) : new Security(_config);
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
            security.verifyToken<{ uid: string }>(token).then(value => {
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
        const rules = (_config.adapters && _config.adapters.rules) ?
            _config.adapters.rules(_config) : new Rules(_config);
        rules.rulesBlock = body;
        Promise.all([
            rules.handleAuthenticationRule(),
            rules.handleAuthorizationRule(),
            rules.handleCreateRules(),
            rules.handleUpdateRules(),
            rules.handleDeleteRules(),
            rules.handleQueryRules(),
            rules.handleTransactionRule()
        ]).then(_ => {
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
