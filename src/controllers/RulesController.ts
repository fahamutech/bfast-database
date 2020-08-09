import {RuleResultModel, RulesBlockModel} from "../model/RulesBlockModel";
import {UpdateModel} from "../model/UpdateModel";
import {DeleteModel} from "../model/DeleteModel";
import {DatabaseController} from "./DatabaseController";
import {Database} from "../factory/Database";
import {Auth} from "../factory/Auth";
import {AuthController} from "./AuthController";
import {SecurityController} from "./SecurityController";
import {Email} from "../factory/Email";
import {EmailController} from "./EmailController";
import {BFastDatabaseConfig} from "../bfastDatabaseConfig";
import {EmailAdapter} from "../adapter/EmailAdapter";
import {AuthAdapter} from "../adapter/AuthAdapter";
import {StorageController} from "./StorageController";
import {FilesAdapter} from "../adapter/FilesAdapter";
import {S3Storage} from "../factory/S3Storage";
import {GridFsStorage} from "../factory/GridFsStorage";

let _databaseController: DatabaseController;
let _authController: AuthController;
let _storageController: StorageController;
let _defaultEmail: EmailAdapter;
let _defaultAuth: AuthAdapter;
let _fileAdapter: FilesAdapter;

export class RulesController {

    constructor(private readonly config: BFastDatabaseConfig) {
        _databaseController = new DatabaseController(
            (config.adapters && config.adapters.database) ?
                this.config.adapters.database(config) : new Database(config),
            new SecurityController()
        );

        _defaultEmail = (config && config.adapters && config.adapters.email)
            ? config.adapters.email(config)
            : new Email();

        _defaultAuth = (config && config.adapters && config.adapters.auth)
            ? config.adapters.auth(config)
            : new Auth(_databaseController, new SecurityController(), new EmailController(_defaultEmail));

        _authController = new AuthController(_defaultAuth, _databaseController);

        _fileAdapter = (config && config.adapters && config.adapters.s3Storage)
            ? new S3Storage(new SecurityController(), config)
            : new GridFsStorage(new SecurityController(), config, config.mongoDbUri);

        _storageController = new StorageController(_fileAdapter, config);

    }


    /**
     * get all rules from rule block
     * @param rulesBlockModel {RulesBlockModel}
     */
    getRulesKey(rulesBlockModel: RulesBlockModel): string[] {
        if (rulesBlockModel) {
            return Object.keys(rulesBlockModel);
        }
        return Object.keys({});
    }

    async handleAuthenticationRule(rulesBlockModel: RulesBlockModel, ruleResultModel: RuleResultModel): Promise<RuleResultModel> {
        try {
            const authenticationRules = this.getRulesKey(rulesBlockModel).filter(rule => rule.startsWith('auth'));
            if (authenticationRules.length === 0) {
                return ruleResultModel;
            }
            const authenticationRule = authenticationRules[0];
            const auth = rulesBlockModel[authenticationRule];
            for (const action of Object.keys(auth)) {
                const data = auth[action];
                try {
                    if (action === 'signUp') {
                        ruleResultModel["auth"] = {};
                        ruleResultModel["auth"].signUp = await _authController.signUp(data, rulesBlockModel.context);
                    } else if (action === 'signIn') {
                        ruleResultModel["auth"] = {};
                        ruleResultModel["auth"].signIn = await _authController.signIn(data, rulesBlockModel.context);
                    } else if (action === 'reset') {
                        ruleResultModel["auth"] = {};
                        ruleResultModel["auth"].resetPassword = await _authController.resetPassword(data.email ? data.email : data);
                    }
                } catch (e) {
                    ruleResultModel['errors'][`auth.${action}`] = {
                        message: e.message ? e.message : e.toString(),
                        path: `auth.${action}`,
                        data: data
                    };
                }
            }
            return ruleResultModel;
        } catch (e) {
            ruleResultModel['errors']['auth'] = {
                message: e.message ? e.message : e.toString(),
                path: 'auth',
                data: null
            };
            return ruleResultModel;
        }
    }

    async handleAuthorizationRule(rulesBlockModel: RulesBlockModel, ruleResultModel: RuleResultModel): Promise<RuleResultModel> {
        try {
            const policyRules = this.getRulesKey(rulesBlockModel).filter(rule => rule.startsWith('policy'));
            if (policyRules.length === 0) {
                return ruleResultModel;
            }
            if (!(rulesBlockModel.context && rulesBlockModel.context.useMasterKey === true)) {
                ruleResultModel['errors']['policy'] = {
                    message: 'policy rule require masterKey',
                    path: 'policy',
                    data: null
                };
                return ruleResultModel;
            }
            const authorizationRule = policyRules[0];
            const policy = rulesBlockModel[authorizationRule];
            for (const action of Object.keys(policy)) {
                const data = policy[action];
                try {
                    if (action === 'add' && typeof data === 'object') {
                        const authorizationResults = {};
                        for (const rule of Object.keys(data)) {
                            authorizationResults[rule] = await _authController.addAuthorizationRule(rule, data[rule], rulesBlockModel.context);
                        }
                        ruleResultModel["policy"] = {};
                        ruleResultModel["policy"][action] = authorizationResults;
                    } else if (action === 'list' && typeof data === "object") {
                        ruleResultModel["policy"] = {};
                        ruleResultModel["policy"][action] = await _databaseController.query('_Policy', {
                            filter: {},
                            return: []
                        }, rulesBlockModel.context, {
                            bypassDomainVerification: true
                        });
                    } else if (action === 'remove' && typeof data === 'object') {
                        ruleResultModel["policy"] = {};
                        ruleResultModel["policy"][action] = await _databaseController.delete('_Policy', {
                            filter: {
                                ruleId: data['ruleId']
                            },
                            return: [],
                            id: null
                        }, rulesBlockModel.context, {
                            bypassDomainVerification: true
                        });
                    }
                } catch (e) {
                    ruleResultModel['errors'][`policy.${action}`] = {
                        message: e.message ? e.message : e.toString(),
                        path: `policy.${action}`,
                        data: data
                    };
                }
            }
            return ruleResultModel;
        } catch (e) {
            ruleResultModel['errors']['policy'] = {
                message: e.message ? e.message : e.toString(),
                path: 'policy',
                data: null
            };
            return ruleResultModel;
        }
    }

    async handleIndexesRule(rulesBlockModel: RulesBlockModel, ruleResultModel: RuleResultModel): Promise<RuleResultModel> {
        try {
            const indexRules = this.getRulesKey(rulesBlockModel).filter(rule => rule.startsWith('index'));
            if (indexRules.length === 0) {
                return ruleResultModel;
            }
            if (!(rulesBlockModel?.context && rulesBlockModel?.context?.useMasterKey === true)) {
                ruleResultModel['errors']['index'] = {
                    message: 'index rule require masterKey',
                    path: 'index',
                    data: null
                };
                return ruleResultModel;
            }
            for (const indexRuleElement of indexRules) {
                const domain = this.extractDomain(indexRuleElement, 'index');
                const indexRuleBlock = rulesBlockModel[indexRuleElement];
                for (const action of Object.keys(indexRuleBlock)) {
                    const data = indexRuleBlock[action];
                    try {
                        ruleResultModel[indexRuleElement] = {};
                        if (action === 'add' && Array.isArray(data)) {
                            ruleResultModel[indexRuleElement][action] = await _databaseController.addIndexes(domain, data);
                        } else if (action === 'list' && typeof data === "object") {
                            ruleResultModel[indexRuleElement][action] = await _databaseController.listIndexes(domain);
                        } else if (action === 'remove' && typeof data === 'object') {
                            ruleResultModel[indexRuleElement][action] = await _databaseController.removeIndexes(domain);
                        }
                    } catch (e) {
                        ruleResultModel['errors'][`index.${domain}.${action}`] = {
                            message: e.message ? e.message : e.toString(),
                            path: `index.${domain}.${action}`,
                            data: data
                        };
                    }
                }
            }
            return ruleResultModel;
        } catch (e) {
            ruleResultModel['errors']['index'] = {
                message: e.message ? e.message : e.toString(),
                path: 'index',
                data: null
            };
            return ruleResultModel;
        }
    }

    async handleCreateRules(rulesBlockModel: RulesBlockModel, ruleResultModel: RuleResultModel, transactionSession?: any): Promise<RuleResultModel> {
        try {
            const createRules = this.getRulesKey(rulesBlockModel).filter(rule => rule.startsWith('create'));
            if (createRules.length === 0) {
                return ruleResultModel;
            }
            for (const createRule of createRules) {
                const domain = this.extractDomain(createRule, 'create');
                const rulesBlockModelElement = rulesBlockModel[createRule];
                // checkPermission
                const allowed = await _authController.hasPermission(`create.${domain}`, rulesBlockModel?.context);
                if (allowed !== true) {
                    ruleResultModel['errors'][`${transactionSession ? 'transaction.' : ''}create.${domain}`] = {
                        message: 'You have insufficient permission to this resource',
                        path: `${transactionSession ? 'transaction.' : ''}create.${domain}`,
                        data: rulesBlockModelElement
                    };
                    return ruleResultModel;
                }
                try {
                    let result;
                    if (rulesBlockModelElement && Array.isArray(rulesBlockModelElement)) {
                        result = await _databaseController.writeMany(domain, rulesBlockModelElement, rulesBlockModel?.context, {
                            bypassDomainVerification: rulesBlockModel?.context?.useMasterKey === true,
                            transaction: transactionSession
                        });
                    } else {
                        result = await _databaseController.writeOne(domain, rulesBlockModelElement, rulesBlockModel?.context, {
                            bypassDomainVerification: rulesBlockModel?.context?.useMasterKey === true,
                            transaction: transactionSession
                        });
                    }
                    ruleResultModel[createRule] = result
                } catch (e) {
                    ruleResultModel.errors[`${transactionSession ? 'transaction.' : ''}create.${domain}`] = {
                        message: e.message ? e.message : e.toString(),
                        path: `${transactionSession ? 'transaction.' : ''}create.${domain}`,
                        data: rulesBlockModelElement
                    };
                    if (transactionSession) {
                        throw e;
                    }
                }
            }
            return ruleResultModel;
        } catch (e) {
            ruleResultModel.errors[`${transactionSession ? 'transaction.' : ''}create`] = {
                message: e.message ? e.message : e.toString(),
                path: `${transactionSession ? 'transaction.' : ''}create`,
                data: null
            };
            if (transactionSession) {
                throw e;
            }
            return ruleResultModel;
        }
    }

    async handleDeleteRules(rulesBlockModel: RulesBlockModel, ruleResultModel: RuleResultModel, transactionSession?: any): Promise<RuleResultModel> {
        try {
            const deleteRules = this.getRulesKey(rulesBlockModel).filter(rule => rule.startsWith('delete'));
            if (deleteRules.length === 0) {
                return ruleResultModel;
            }
            for (const deleteRule of deleteRules) {
                const domain = this.extractDomain(deleteRule, 'delete');
                const rulesBlockModelElement: DeleteModel<any> = rulesBlockModel[deleteRule];
                // checkPermission
                const allowed = await _authController.hasPermission(`delete.${domain}`, rulesBlockModel?.context);
                if (allowed !== true) {
                    ruleResultModel.errors[`${transactionSession ? 'transaction.' : ''}delete.${domain}`] = {
                        message: 'You have insufficient permission to this resource',
                        path: `${transactionSession ? 'transaction.' : ''}delete.${domain}`,
                        data: rulesBlockModelElement
                    };
                    return ruleResultModel;
                }
                try {
                    if (rulesBlockModelElement.id) {
                        const filter: any = {};
                        delete rulesBlockModelElement.filter;
                        filter['_id'] = rulesBlockModelElement.id;
                        rulesBlockModelElement.filter = filter;
                        ruleResultModel[deleteRule]
                            = await _databaseController.delete(domain, rulesBlockModelElement, rulesBlockModel?.context, {
                            bypassDomainVerification: rulesBlockModel?.context?.useMasterKey === true,
                            transaction: transactionSession
                        });
                    } else {
                        if (!rulesBlockModelElement.filter) {
                            throw "filter field is required if you dont supply id field";
                        }
                        if (rulesBlockModelElement.filter && Object.keys(rulesBlockModelElement).length === 0) {
                            throw "Empty filter map is not supported in delete rule";
                        }
                        const query: any[] = await _databaseController.query(domain, rulesBlockModelElement, rulesBlockModel?.context, {
                            bypassDomainVerification: rulesBlockModel?.context?.useMasterKey === true,
                            transaction: transactionSession
                        });
                        const deleteResults = [];
                        if (query && Array.isArray(query)) {
                            for (const value of query) {
                                rulesBlockModelElement.filter = {
                                    _id: value.id
                                };
                                const result = await _databaseController.delete(domain, rulesBlockModelElement, rulesBlockModel?.context, {
                                    bypassDomainVerification: rulesBlockModel?.context?.useMasterKey === true,
                                    transaction: transactionSession
                                });
                                deleteResults.push(result);
                            }
                        }
                        ruleResultModel[deleteRule] = deleteResults;
                    }
                } catch (e) {
                    ruleResultModel.errors[`${transactionSession ? 'transaction.' : ''}delete.${domain}`] = {
                        message: e.message ? e.message : e.toString(),
                        path: `${transactionSession ? 'transaction.' : ''}delete.${domain}`,
                        data: rulesBlockModelElement
                    };
                    if (transactionSession) {
                        throw e;
                    }
                }
            }
            return ruleResultModel;
        } catch (e) {
            ruleResultModel.errors[`${transactionSession ? 'transaction.' : ''}delete`] = {
                message: e.message ? e.message : e.toString(),
                path: `${transactionSession ? 'transaction.' : ''}delete`,
                data: null
            };
            if (transactionSession) {
                throw e;
            }
            return ruleResultModel;
        }
    }

    async handleQueryRules(rulesBlockModel: RulesBlockModel, ruleResultModel: RuleResultModel, transactionSession?: any): Promise<RuleResultModel> {
        try {
            const queryRules = this.getRulesKey(rulesBlockModel).filter(rule => rule.startsWith('query'));
            if (queryRules.length === 0) {
                return ruleResultModel;
            }
            for (const queryRule of queryRules) {
                const domain = this.extractDomain(queryRule, 'query');
                const rulesBlockModelElement = rulesBlockModel[queryRule];
                // checkPermission
                const allowed = await _authController.hasPermission(`query.${domain}`, rulesBlockModel?.context);
                if (allowed !== true) {
                    ruleResultModel.errors[`${transactionSession ? 'transactionSession.' : ''}query.${domain}`] = {
                        message: 'You have insufficient permission to this resource',
                        path: `${transactionSession ? 'transactionSession.' : ''}query.${domain}`,
                        data: rulesBlockModelElement
                    };
                    return ruleResultModel;
                }
                try {
                    if (rulesBlockModelElement && Array.isArray(rulesBlockModelElement)) {
                        ruleResultModel.errors[queryRule] = {
                            message: 'query data must be a map',
                            path: queryRule,
                            data: rulesBlockModelElement,
                        };
                    } else {
                        ruleResultModel[queryRule]
                            = await _databaseController.query(domain, rulesBlockModelElement, rulesBlockModel?.context, {
                            bypassDomainVerification: rulesBlockModel?.context?.useMasterKey === true,
                            transaction: transactionSession
                        });
                    }
                } catch (e) {
                    ruleResultModel.errors[`${transactionSession ? 'transactionSession.' : ''}query.${domain}`] = {
                        message: e.message ? e.message : e.toString(),
                        path: `${transactionSession ? 'transactionSession.' : ''}query.${domain}`,
                        data: rulesBlockModelElement
                    };
                    if (transactionSession) {
                        throw e;
                    }
                }
            }
            return ruleResultModel;
        } catch (e) {
            ruleResultModel.errors[`${transactionSession ? 'transactionSession.' : ''}query`] = {
                message: e.message ? e.message : e.toString(),
                path: `${transactionSession ? 'transactionSession.' : ''}query`,
                data: null
            };
            if (transactionSession) {
                throw e;
            }
            return ruleResultModel;
        }
    }

    async handleTransactionRule(rulesBlockModel: RulesBlockModel, ruleResultModel: RuleResultModel): Promise<RuleResultModel> {
        try {
            const transactionRules = this.getRulesKey(rulesBlockModel).filter(rule => rule.startsWith('transaction'));
            if (transactionRules.length === 0) {
                return ruleResultModel;
            }
            const transactionRule = transactionRules[0];
            const transaction = rulesBlockModel[transactionRule];
            const transactionOperationRules = transaction.commit;
            const resultObject: RuleResultModel = {errors: {}};
            await _databaseController.transaction(async session => {
                await this.handleCreateRules(transactionOperationRules, resultObject, session);
                await this.handleUpdateRules(transactionOperationRules, resultObject, session);
                await this.handleQueryRules(transactionOperationRules, resultObject, session);
                await this.handleDeleteRules(transactionOperationRules, resultObject, session);
            });
            ruleResultModel['transaction'] = {commit: resultObject};
            return ruleResultModel;
        } catch (e) {
            ruleResultModel.errors['transaction'] = {
                message: e.message ? e.message : e.toString(),
                path: 'transaction',
                data: null
            };
            return ruleResultModel;
        }
    }

    async handleUpdateRules(rulesBlockModel: RulesBlockModel, ruleResultModel: RuleResultModel, transactionSession?: any): Promise<RuleResultModel> {
        try {
            const updateRules = this.getRulesKey(rulesBlockModel).filter(rule => rule.startsWith('update'));
            if (updateRules.length === 0) {
                return ruleResultModel;
            }
            for (const updateRule of updateRules) {
                const domain = this.extractDomain(updateRule, 'update');
                const rulesBlockModelElement: UpdateModel<any> = rulesBlockModel[updateRule];
                // checkPermission
                const allowed = await _authController.hasPermission(`update.${domain}`, rulesBlockModel.context);
                if (allowed !== true) {
                    ruleResultModel.errors[`${transactionSession ? 'transaction.' : ''}update.${domain}`] = {
                        message: 'You have insufficient permission to this resource',
                        path: `${transactionSession ? 'transaction.' : ''}update.${domain}`,
                        data: rulesBlockModelElement
                    };
                    return ruleResultModel;
                }
                try {
                    if (Object.keys(rulesBlockModelElement).length === 0) {
                        throw "Empty map is not supported in update rule";
                    }
                    if (!rulesBlockModelElement.update) {
                        throw "Please update field is required, which contains properties to update a document"
                    }
                    if (rulesBlockModelElement?.id) {
                        const filter: any = {};
                        delete rulesBlockModelElement.filter;
                        filter['_id'] = rulesBlockModelElement.id;
                        rulesBlockModelElement.filter = filter;
                        ruleResultModel[updateRule]
                            = await _databaseController.update(domain, rulesBlockModelElement, rulesBlockModel?.context, {
                            bypassDomainVerification: rulesBlockModel?.context?.useMasterKey === true,
                            transaction: transactionSession
                        });
                    } else if (rulesBlockModelElement?.filter) {
                        const query: any[] = await _databaseController.query(domain, rulesBlockModelElement, rulesBlockModel.context, {
                            bypassDomainVerification: rulesBlockModel?.context?.useMasterKey === true,
                            transaction: transactionSession
                        });
                        const updateResults = [];
                        if (query && Array.isArray(query)) {
                            for (const value of query) {
                                rulesBlockModelElement.filter = {
                                    _id: value.id
                                };
                                const result = await _databaseController.update(domain, rulesBlockModelElement, rulesBlockModel?.context, {
                                    bypassDomainVerification: rulesBlockModel?.context?.useMasterKey === true,
                                    transaction: transactionSession
                                });
                                updateResults.push(result);
                            }
                        }
                        ruleResultModel[updateRule] = updateResults;
                    } else {
                        throw "Bad data format in update rule, no filter nor id";
                    }
                } catch (e) {
                    ruleResultModel.errors[`${transactionSession ? 'transaction.' : ''}update.${domain}`] = {
                        message: e.message ? e.message : e.toString(),
                        path: `${transactionSession ? 'transaction.' : ''}update.${domain}`,
                        data: rulesBlockModelElement
                    };
                    if (transactionSession) {
                        throw e;
                    }
                }
            }
            return ruleResultModel;
        } catch (e) {
            ruleResultModel.errors[`${transactionSession ? 'transaction.' : ''}update`] = {
                message: e.message ? e.message : e.toString(),
                path: `${transactionSession ? 'transaction.' : ''}update`,
                data: null
            };
            if (transactionSession) {
                throw e;
            }
            return ruleResultModel;
        }
    }

    async handleAggregationRules(rulesBlockModel: RulesBlockModel, ruleResultModel: RuleResultModel, transactionSession?: any): Promise<RuleResultModel> {
        try {
            const aggregateRules = this.getRulesKey(rulesBlockModel).filter(rule => rule.startsWith('aggregate'));
            if (aggregateRules.length === 0) {
                return ruleResultModel;
            }
            if (!(rulesBlockModel.context && rulesBlockModel.context.useMasterKey === true)) {
                ruleResultModel.errors['aggregate'] = {
                    message: 'aggregate rule require masterKey',
                    path: 'aggregate',
                    data: null
                };
                return ruleResultModel;
            }
            for (const aggregateRule of aggregateRules) {
                const domain = this.extractDomain(aggregateRule, 'aggregate');
                const data = rulesBlockModel[aggregateRule];
                try {
                    if (!(data && Array.isArray(data))) {
                        throw {message: "A pipeline must be an array"};
                    }
                    ruleResultModel[aggregateRule]
                        = await _databaseController.aggregate(domain, data, rulesBlockModel?.context, {
                        bypassDomainVerification: true,
                        transaction: transactionSession
                    });

                } catch (e) {
                    ruleResultModel.errors[`${transactionSession ? 'transaction.' : ''}aggregate.${domain}`] = {
                        message: e.message ? e.message : e.toString(),
                        path: `${transactionSession ? 'transaction.' : ''}aggregate.${domain}`,
                        data: data
                    };
                    if (transactionSession) {
                        throw e;
                    }
                }
            }
            return ruleResultModel;
        } catch (e) {
            ruleResultModel.errors[`${transactionSession ? 'transaction.' : ''}aggregate`] = {
                message: e.message ? e.message : e.toString(),
                path: `${transactionSession ? 'transaction.' : ''}aggregate`,
                data: null
            };
            if (transactionSession) {
                throw e;
            }
            return ruleResultModel;
        }
    }

    async handleStorageRule(rulesBlockModel: RulesBlockModel, ruleResultModel: RuleResultModel): Promise<RuleResultModel> {
        try {
            const fileRules = this.getRulesKey(rulesBlockModel).filter(rule => rule.startsWith('files'));
            if (fileRules.length === 0) {
                return ruleResultModel;
            }
            const fileRule = fileRules[0];
            const file = rulesBlockModel[fileRule];
            for (const action of Object.keys(file)) {
                const data = file[action];
                try {
                    if (action === 'save') {
                        const allowed = await _authController.hasPermission(`files.save`, rulesBlockModel.context);
                        if (allowed !== true) {
                            ruleResultModel.errors[`files.save`] = {
                                message: 'You have insufficient permission to save file',
                                path: `files.save`,
                                data: data
                            };
                        } else {
                            ruleResultModel["files"] = {};
                            ruleResultModel["files"].save = await _storageController.save(data, rulesBlockModel.context);
                        }
                    } else if (action === 'delete') {
                        const allowed = await _authController.hasPermission(`files.delete`, rulesBlockModel.context);
                        if (allowed !== true) {
                            ruleResultModel.errors[`files.delete`] = {
                                message: 'You have insufficient permission delete file',
                                path: `files.delete`,
                                data: data
                            };
                        } else {
                            ruleResultModel["files"] = {};
                            ruleResultModel["files"].delete = await _storageController.delete(data, rulesBlockModel.context);
                        }
                    } else if (action === 'list') {
                        const allowed = await _authController.hasPermission(`files.list`, rulesBlockModel.context);
                        if (allowed !== true) {
                            ruleResultModel.errors[`files.list`] = {
                                message: 'You have insufficient permission list files',
                                path: `files.delete`,
                                data: data
                            };
                        } else {
                            ruleResultModel["files"] = {};
                            ruleResultModel["files"].list = await _storageController.listFiles({
                                prefix: data && data.prefix ? data.prefix : '',
                                size: data && data.size ? data.size : 20,
                                after: data.after,
                                skip: data && data.skip ? data.skip : 0
                            });
                        }
                    }
                } catch (e) {
                    ruleResultModel.errors[`files.${action}`] = {
                        message: e.message ? e.message : e.toString(),
                        path: `files.${action}`,
                        data: data
                    };
                }
            }
            return ruleResultModel;
        } catch (e) {
            ruleResultModel.errors['files'] = {
                message: e.message ? e.message : e.toString(),
                path: 'files',
                data: null
            };
            return ruleResultModel;
        }
    }

    /**
     * extract a domain/table/collection from the rule
     * @param rule {string} rule with domain
     * @param remove {string} rule action to remove
     */
    extractDomain(rule: string, remove: 'create' | 'query' | 'update' | 'delete' | 'index' | 'aggregate'): string {
        if ((remove === "create" || remove === "query" || remove === "update" || remove === "index"
            || remove === "delete" || remove === "aggregate") && rule.startsWith(remove)) {
            return rule.trim().replace(remove, '');
        } else {
            return null;
        }
    }

}
