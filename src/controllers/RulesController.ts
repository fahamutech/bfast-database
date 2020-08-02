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
import {ConfigAdapter} from "../config";
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

    constructor(private readonly config: ConfigAdapter) {
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
            : new GridFsStorage(new SecurityController(), config.mongoDbUri);

        _storageController = new StorageController(_fileAdapter);

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

    async handleAuthenticationRule(rulesBlockModel: RulesBlockModel, ruleResultModel: RuleResultModel): Promise<Object> {
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

    async handleAuthorizationRule(rulesBlockModel: RulesBlockModel, ruleResultModel: RuleResultModel): Promise<Object> {
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
                    if (action === 'rules' && typeof data === 'object') {
                        const authorizationResults = {};
                        for (const rule of Object.keys(data)) {
                            authorizationResults[rule] = await _authController.addAuthorizationRule(rule, data[rule], rulesBlockModel.context);
                        }
                        ruleResultModel["policy"] = {};
                        ruleResultModel["policy"][action] = authorizationResults;
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

    async handleCreateRules(rulesBlockModel: RulesBlockModel, ruleResultModel: RuleResultModel, transaction?: any): Promise<Object> {
        try {
            const createRules = this.getRulesKey(rulesBlockModel).filter(rule => rule.startsWith('Create'));
            if (createRules.length === 0) {
                return ruleResultModel;
            }
            for (const createRule of createRules) {
                const domain = this.extractDomain(createRule, 'Create');
                const data = rulesBlockModel[createRule];
                // checkPermission
                const allowed = await _authController.hasPermission(`create.${domain}`, rulesBlockModel.context);
                if (allowed !== true) {
                    ruleResultModel['errors'][`${transaction ? 'Transaction.' : ''}Create.${domain}`] = {
                        message: 'You have insufficient permission to this resource',
                        path: `${transaction ? 'Transaction.' : ''}Create.${domain}`,
                        data: data
                    };
                    return ruleResultModel;
                }

                try {
                    let result;
                    if (data && Array.isArray(data)) {
                        result = await _databaseController.writeMany(domain, data, rulesBlockModel.context, {
                            bypassDomainVerification: rulesBlockModel.context.useMasterKey === true,
                            transaction: transaction
                        });
                    } else {
                        result = await _databaseController.writeOne(domain, data, rulesBlockModel.context, {
                            bypassDomainVerification: rulesBlockModel.context.useMasterKey === true,
                            transaction: transaction
                        });
                    }
                    ruleResultModel[`ResultOf${createRule}`] = result
                } catch (e) {
                    ruleResultModel.errors[`${transaction ? 'Transaction.' : ''}Create.${domain}`] = {
                        message: e.message ? e.message : e.toString(),
                        path: `${transaction ? 'Transaction.' : ''}Create.${domain}`,
                        data: data
                    };
                    if (transaction) {
                        throw e;
                    }
                }
            }
            return ruleResultModel;
        } catch (e) {
            ruleResultModel.errors[`${transaction ? 'Transaction.' : ''}Create`] = {
                message: e.message ? e.message : e.toString(),
                path: `${transaction ? 'Transaction.' : ''}Create`,
                data: null
            };
            if (transaction) {
                throw e;
            }
            return ruleResultModel;
        }
    }

    async handleDeleteRules(rulesBlockModel: RulesBlockModel, ruleResultModel: RuleResultModel, transaction?: any): Promise<Object> {
        try {
            const deleteRules = this.getRulesKey(rulesBlockModel).filter(rule => rule.startsWith('delete'));
            if (deleteRules.length === 0) {
                return ruleResultModel;
            }
            for (const deleteRule of deleteRules) {
                const domain = this.extractDomain(deleteRule, 'delete');
                const data: DeleteModel<any> = rulesBlockModel[deleteRule];
                // checkPermission
                const allowed = await _authController.hasPermission(`delete.${domain}`, rulesBlockModel.context);
                if (allowed !== true) {
                    ruleResultModel.errors[`${transaction ? 'Transaction.' : ''}delete.${domain}`] = {
                        message: 'You have insufficient permission to this resource',
                        path: `${transaction ? 'Transaction.' : ''}delete.${domain}`,
                        data: data
                    };
                    return ruleResultModel;
                }
                try {
                    if (data.id) {
                        const filter: any = {};
                        delete data.filter;
                        filter['_id'] = data.id;
                        data.filter = filter;
                        ruleResultModel[deleteRule]
                            = await _databaseController.delete(domain, data, rulesBlockModel.context, {
                            bypassDomainVerification: rulesBlockModel.context.useMasterKey === true,
                            transaction: transaction
                        });
                    } else {
                        if (!data.filter) {
                            throw "filter field is required if you dont supply id field";
                        }
                        if (data.filter && Object.keys(data).length === 0) {
                            throw "Empty filter map is not supported in delete rule";
                        }
                        const query: any[] = await _databaseController.query(domain, data, rulesBlockModel.context, {
                            bypassDomainVerification: rulesBlockModel?.context?.useMasterKey === true,
                            transaction: transaction
                        });
                        const deleteResults = [];
                        if (query && Array.isArray(query)) {
                            for (const value of query) {
                                data.filter = {
                                    _id: value.id
                                };
                                const result = await _databaseController.delete(domain, data, rulesBlockModel.context, {
                                    bypassDomainVerification: rulesBlockModel.context.useMasterKey === true,
                                    transaction: transaction
                                });
                                deleteResults.push(result);
                            }
                        }
                        ruleResultModel[deleteRule] = deleteResults;
                    }
                } catch (e) {
                    ruleResultModel.errors[`${transaction ? 'Transaction.' : ''}delete.${domain}`] = {
                        message: e.message ? e.message : e.toString(),
                        path: `${transaction ? 'Transaction.' : ''}delete.${domain}`,
                        data: data
                    };
                    if (transaction) {
                        throw e;
                    }
                }
            }
            return ruleResultModel;
        } catch (e) {
            ruleResultModel.errors[`${transaction ? 'Transaction.' : ''}delete`] = {
                message: e.message ? e.message : e.toString(),
                path: `${transaction ? 'Transaction.' : ''}delete`,
                data: null
            };
            if (transaction) {
                throw e;
            }
            return ruleResultModel;
        }
    }

    async handleQueryRules(rulesBlockModel: RulesBlockModel, ruleResultModel: RuleResultModel, transaction?: any): Promise<Object> {
        try {
            const queryRules = this.getRulesKey(rulesBlockModel).filter(rule => rule.startsWith('Query'));
            if (queryRules.length === 0) {
                return ruleResultModel;
            }
            for (const queryRule of queryRules) {
                const domain = this.extractDomain(queryRule, 'Query');
                const data = rulesBlockModel[queryRule];
                // checkPermission
                const allowed = await _authController.hasPermission(`query.${domain}`, rulesBlockModel.context);
                if (allowed !== true) {
                    ruleResultModel.errors[`${transaction ? 'Transaction.' : ''}Query.${domain}`] = {
                        message: 'You have insufficient permission to this resource',
                        path: `${transaction ? 'Transaction.' : ''}Query.${domain}`,
                        data: data
                    };
                    return ruleResultModel;
                }
                try {
                    if (data && Array.isArray(data)) {
                        ruleResultModel.errors[queryRule] = {
                            message: 'Query data must be a map',
                            path: queryRule,
                            data: data,
                        };
                    } else {
                        ruleResultModel[`ResultOf${queryRule}`]
                            = await _databaseController.query(domain, data, rulesBlockModel.context, {
                            bypassDomainVerification: rulesBlockModel.context.useMasterKey === true,
                            transaction: transaction
                        });
                    }
                } catch (e) {
                    ruleResultModel.errors[`${transaction ? 'Transaction.' : ''}Query.${domain}`] = {
                        message: e.message ? e.message : e.toString(),
                        path: `${transaction ? 'Transaction.' : ''}Query.${domain}`,
                        data: data
                    };
                    if (transaction) {
                        throw e;
                    }
                }
            }
            return ruleResultModel;
        } catch (e) {
            ruleResultModel.errors[`${transaction ? 'Transaction.' : ''}Query`] = {
                message: e.message ? e.message : e.toString(),
                path: `${transaction ? 'Transaction.' : ''}Query`,
                data: null
            };
            if (transaction) {
                throw e;
            }
            return ruleResultModel;
        }
    }

    async handleTransactionRule(rulesBlockModel: RulesBlockModel, ruleResultModel: RuleResultModel): Promise<Object> {
        try {
            const transactionRules = this.getRulesKey(rulesBlockModel).filter(rule => rule.startsWith('Transaction'));
            if (transactionRules.length === 0) {
                return ruleResultModel;
            }
            const transactionRule = transactionRules[0];
            const transaction = rulesBlockModel[transactionRule];
            const transactionOperationRules = transaction.commit;
            const resultObject: any = {};
            await _databaseController.transaction(async session => {
                await this.handleCreateRules(transactionOperationRules, resultObject, session);
                await this.handleUpdateRules(transactionOperationRules, resultObject, session);
                await this.handleDeleteRules(transactionOperationRules, resultObject, session);
                await this.handleQueryRules(transactionOperationRules, resultObject, session);
            });
            ruleResultModel[`ResultOfTransaction`] = resultObject;
        } catch (e) {
            ruleResultModel.errors['Transaction'] = {
                message: e.message ? e.message : e.toString(),
                path: 'Transaction',
                data: null
            };
            return ruleResultModel;
        }
    }

    async handleUpdateRules(rulesBlockModel: RulesBlockModel, ruleResultModel: RuleResultModel, transaction?: any): Promise<RuleResultModel> {
        try {
            const updateRules = this.getRulesKey(rulesBlockModel).filter(rule => rule.startsWith('Update'));
            if (updateRules.length === 0) {
                return ruleResultModel;
            }
            for (const updateRule of updateRules) {
                const domain = this.extractDomain(updateRule, 'Update');
                const data: UpdateModel<any> = rulesBlockModel[updateRule];
                // checkPermission
                const allowed = await _authController.hasPermission(`update.${domain}`, rulesBlockModel.context);
                if (allowed !== true) {
                    ruleResultModel.errors[`${transaction ? 'Transaction.' : ''}Update.${domain}`] = {
                        message: 'You have insufficient permission to this resource',
                        path: `${transaction ? 'Transaction.' : ''}Update.${domain}`,
                        data: data
                    };
                    return ruleResultModel;
                }
                try {
                    if (Object.keys(data).length === 0) {
                        throw "Empty map is not supported in update rule";
                    }
                    if (!data.update) {
                        throw "Please update field is required, which contains properties to update a document"
                    }
                    if (data?.id) {
                        const filter: any = {};
                        delete data.filter;
                        filter['_id'] = data.id;
                        data.filter = filter;
                        ruleResultModel[`ResultOf${updateRule}`]
                            = await _databaseController.update(domain, data, rulesBlockModel.context, {
                            bypassDomainVerification: rulesBlockModel.context.useMasterKey === true,
                            transaction: transaction
                        })
                    } else if (data?.filter) {
                        const query: any[] = await _databaseController.query(domain, data, rulesBlockModel.context, {
                            bypassDomainVerification: rulesBlockModel.context.useMasterKey === true,
                            transaction: transaction
                        });
                        const updateResults = [];
                        if (query && Array.isArray(query)) {
                            for (const value of query) {
                                data.filter = {
                                    _id: value.id
                                };
                                const result = await _databaseController.update(domain, data, rulesBlockModel.context, {
                                    bypassDomainVerification: rulesBlockModel.context.useMasterKey === true,
                                    transaction: transaction
                                });
                                updateResults.push(result);
                            }
                        }
                        ruleResultModel[`ResultOf${updateRule}`] = updateResults;
                    } else {
                        throw "Bad data format in update rule, no filter nor id";
                    }
                } catch (e) {
                    ruleResultModel.errors[`${transaction ? 'Transaction.' : ''}Update.${domain}`] = {
                        message: e.message ? e.message : e.toString(),
                        path: `${transaction ? 'Transaction.' : ''}Update.${domain}`,
                        data: data
                    };
                    if (transaction) {
                        throw e;
                    }
                }
            }
            return ruleResultModel;
        } catch (e) {
            ruleResultModel.errors[`${transaction ? 'Transaction.' : ''}Update`] = {
                message: e.message ? e.message : e.toString(),
                path: `${transaction ? 'Transaction.' : ''}Update`,
                data: null
            };
            if (transaction) {
                throw e;
            }
            return ruleResultModel;
        }
    }

    async handleAggregationRules(rulesBlockModel: RulesBlockModel, ruleResultModel: RuleResultModel, transaction?: any): Promise<RuleResultModel> {
        try {
            const aggregateRules = this.getRulesKey(rulesBlockModel).filter(rule => rule.startsWith('Aggregate'));
            if (aggregateRules.length === 0) {
                return ruleResultModel;
            }
            if (!(rulesBlockModel.context && rulesBlockModel.context.useMasterKey === true)) {
                ruleResultModel.errors['Aggregate'] = {
                    message: 'Aggregate rule require masterKey',
                    path: 'Aggregate',
                    data: null
                };
                return ruleResultModel;
            }
            for (const aggregateRule of aggregateRules) {
                const domain = this.extractDomain(aggregateRule, 'Aggregate');
                const data = rulesBlockModel[aggregateRule];
                try {
                    if (!(data && Array.isArray(data))) {
                        throw {message: "A pipeline must be an array"};
                    }
                    ruleResultModel[`ResultOf${aggregateRule}`]
                        = await _databaseController.aggregate(domain, data, rulesBlockModel.context, {
                        bypassDomainVerification: true,
                        transaction: transaction
                    });

                } catch (e) {
                    ruleResultModel.errors[`${transaction ? 'Transaction.' : ''}Aggregate.${domain}`] = {
                        message: e.message ? e.message : e.toString(),
                        path: `${transaction ? 'Transaction.' : ''}Aggregate.${domain}`,
                        data: data
                    };
                    if (transaction) {
                        throw e;
                    }
                }
            }
            return ruleResultModel;
        } catch (e) {
            ruleResultModel.errors[`${transaction ? 'Transaction.' : ''}Aggregate`] = {
                message: e.message ? e.message : e.toString(),
                path: `${transaction ? 'Transaction.' : ''}Aggregate`,
                data: null
            };
            if (transaction) {
                throw e;
            }
            return ruleResultModel;
        }
    }

    async handleStorageRule(rulesBlockModel: RulesBlockModel, ruleResultModel: RuleResultModel): Promise<RuleResultModel> {
        try {
            const fileRules = this.getRulesKey(rulesBlockModel).filter(rule => rule.startsWith('Files'));
            if (fileRules.length === 0) {
                return ruleResultModel;
            }
            const fileRule = fileRules[0];
            const file = rulesBlockModel[fileRule];
            for (const action of Object.keys(file)) {
                const data = file[action];
                try {
                    if (action === 'save') {
                        // checkPermission
                        const allowed = await _authController.hasPermission(`files.save`, rulesBlockModel.context);
                        if (allowed !== true) {
                            ruleResultModel.errors[`Files.save`] = {
                                message: 'You have insufficient permission save file',
                                path: `Files.save`,
                                data: data
                            };
                        } else {
                            ruleResultModel["ResultOfFiles"] = {};
                            ruleResultModel["ResultOfFiles"].save = await _storageController.save(data, rulesBlockModel.context);
                        }
                    } else if (action === 'delete') {
                        const allowed = await _authController.hasPermission(`files.delete`, rulesBlockModel.context);
                        if (allowed !== true) {
                            ruleResultModel.errors[`Files.delete`] = {
                                message: 'You have insufficient permission delete file',
                                path: `Files.delete`,
                                data: data
                            };
                        } else {
                            ruleResultModel["ResultOfFiles"] = {};
                            ruleResultModel["ResultOfFiles"].delete = await _storageController.delete(data, rulesBlockModel.context);
                        }
                    }
                    // if (action === 'list') {
                    //     this.results["auth"] = {};
                    //     this.results["auth"].resetPassword = await _authController.resetPassword(data.email ? data.email : data);
                    // }
                } catch (e) {
                    ruleResultModel.errors[`Files.${action}`] = {
                        message: e.message ? e.message : e.toString(),
                        path: `Files.${action}`,
                        data: data
                    };
                }
            }
            return ruleResultModel;
        } catch (e) {
            ruleResultModel.errors['Files'] = {
                message: e.message ? e.message : e.toString(),
                path: 'Files',
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
    extractDomain(rule: string, remove: 'Create' | 'Query' | 'Update' | 'delete' | 'Aggregate'): string {
        if ((remove === "Create" || remove === "Query" || remove === "Update" || remove === "delete" || remove === "Aggregate") && rule.startsWith(remove)) {
            return rule.trim().replace(remove, '')
        } else {
            return null;
        }
    }

}
