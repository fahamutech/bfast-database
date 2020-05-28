import {RulesAdapter} from "../adapter/RulesAdapter";
import {RulesBlockModel} from "../model/RulesBlockModel";
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

export class RulesController implements RulesAdapter {
    rulesBlock: RulesBlockModel;
    results: RulesBlockModel = {errors: []};

    constructor(private readonly config: ConfigAdapter) {
        _databaseController = new DatabaseController(
            (config.adapters && config.adapters.database) ?
                this.config.adapters.database(config) : new Database(),
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


    private getRulesKey(rulesBlockModel?: RulesBlockModel): string[] {
        if (rulesBlockModel) {
            return Object.keys(rulesBlockModel);
        }
        if (this.rulesBlock) {
            return Object.keys(this.rulesBlock);
        }
        return Object.keys({});
    }

    async handleAuthenticationRule(): Promise<void> {
        try {
            const authenticationRules = this.getRulesKey().filter(rule => rule.startsWith('Authentication'));
            if (authenticationRules.length === 0) {
                return;
            }
            const authenticationRule = authenticationRules[0];
            const authentication = this.rulesBlock[authenticationRule];
            for (const action of Object.keys(authentication)) {
                const data = authentication[action];
                try {
                    if (action === 'signUp') {
                        this.results["ResultOfAuthentication"] = {};
                        this.results["ResultOfAuthentication"].signUp = await _authController.signUp(data, this.rulesBlock.context);
                    } else if (action === 'signIn') {
                        this.results["ResultOfAuthentication"] = {};
                        this.results["ResultOfAuthentication"].signIn = await _authController.signIn(data, this.rulesBlock.context);
                    } else if (action === 'resetPassword') {
                        this.results["ResultOfAuthentication"] = {};
                        this.results["ResultOfAuthentication"].resetPassword = await _authController.resetPassword(data.email ? data.email : data);
                    }
                } catch (e) {
                    this.results.errors.push({
                        message: e.message ? e.message : e.toString(),
                        path: `Authentication.${action}`,
                        data: data
                    });
                }
            }
            return;
        } catch (e) {
            this.results.errors.push({
                message: e.message ? e.message : e.toString(),
                path: 'Authentication',
                data: null
            });
            return;
        }
    }

    async handleAuthorizationRule(): Promise<void> {
        try {
            const authorizationRules = this.getRulesKey().filter(rule => rule.startsWith('Authorization'));
            if (authorizationRules.length === 0) {
                return;
            }
            if (!(this.rulesBlock.context && this.rulesBlock.context.useMasterKey === true)) {
                this.results.errors.push({
                    message: 'Authorization rule require masterKey',
                    path: 'Authorization',
                    data: null
                });
                return;
            }
            const authorizationRule = authorizationRules[0];
            const authorization = this.rulesBlock[authorizationRule];
            for (const action of Object.keys(authorization)) {
                const data = authorization[action];
                try {
                    if (action === 'rules' && typeof data === 'object') {
                        const authorizationResults = {};
                        for (const rule of Object.keys(data)) {
                            authorizationResults[rule] = await _authController.addAuthorizationRule(rule, data[rule], this.rulesBlock.context);
                        }
                        this.results["ResultOfAuthorization"] = {};
                        this.results["ResultOfAuthorization"][action] = authorizationResults;
                    }
                } catch (e) {
                    this.results.errors.push({
                        message: e.message ? e.message : e.toString(),
                        path: `Authorization.${action}`,
                        data: data
                    });
                }
            }
            return;
        } catch (e) {
            this.results.errors.push({
                message: e.message ? e.message : e.toString(),
                path: 'Authorization',
                data: null
            });
            return;
        }
    }

    async handleCreateRules(rulesBlockModel?: RulesBlockModel, resultsObj?: object, transaction?: any): Promise<void> {
        try {
            const createRules = this.getRulesKey(rulesBlockModel).filter(rule => rule.startsWith('Create'));
            if (createRules.length === 0) {
                return;
            }
            for (const createRule of createRules) {
                const domain = this.extractDomain(createRule, 'Create');
                const data = rulesBlockModel ? rulesBlockModel[createRule] : this.rulesBlock[createRule];
                // checkPermission
                const allowed = await _authController.hasPermission(`create.${domain}`, this.rulesBlock.context);
                if (allowed !== true) {
                    this.results.errors.push({
                        message: 'You have insufficient permission to this resource',
                        path: `${transaction ? 'Transaction.' : ''}Create.${domain}`,
                        data: data
                    });
                    return;
                }

                try {
                    let result;
                    if (data && Array.isArray(data)) {
                        result = await _databaseController.writeMany(domain, data, this.rulesBlock.context, {
                            bypassDomainVerification: this.rulesBlock.context.useMasterKey === true,
                            transaction: transaction
                        });
                    } else {
                        result = await _databaseController.writeOne(domain, data, this.rulesBlock.context, {
                            bypassDomainVerification: this.rulesBlock.context.useMasterKey === true,
                            transaction: transaction
                        });
                    }
                    if (resultsObj) {
                        resultsObj[`ResultOf${createRule}`] = result;
                    } else {
                        this.results[`ResultOf${createRule}`] = result
                    }
                } catch (e) {
                    this.results.errors.push({
                        message: e.message ? e.message : e.toString(),
                        path: `${transaction ? 'Transaction.' : ''}Create.${domain}`,
                        data: data
                    });
                    if (transaction) {
                        throw e;
                    }
                }
            }
            return;
        } catch (e) {
            this.results.errors.push({
                message: e.message ? e.message : e.toString(),
                path: `${transaction ? 'Transaction.' : ''}Create`,
                data: null
            });
            if (transaction) {
                throw e;
            }
            return;
        }
    }

    async handleDeleteRules(rulesBlockModel?: RulesBlockModel, resultsObj?: object, transaction?: any): Promise<void> {
        try {
            const deleteRules = this.getRulesKey(rulesBlockModel).filter(rule => rule.startsWith('Delete'));
            if (deleteRules.length === 0) {
                return;
            }
            for (const deleteRule of deleteRules) {
                const domain = this.extractDomain(deleteRule, 'Delete');
                const data: DeleteModel<any> = rulesBlockModel ? rulesBlockModel[deleteRule] : this.rulesBlock[deleteRule];
                // checkPermission
                const allowed = await _authController.hasPermission(`delete.${domain}`, this.rulesBlock.context);
                if (allowed !== true) {
                    this.results.errors.push({
                        message: 'You have insufficient permission to this resource',
                        path: `${transaction ? 'Transaction.' : ''}Delete.${domain}`,
                        data: data
                    });
                    return;
                }
                try {
                    if (data.id) {
                        const filter: any = {};
                        delete data.filter;
                        filter['_id'] = data.id;
                        data.filter = filter;

                        const result = await _databaseController.delete(domain, data, this.rulesBlock.context, {
                            bypassDomainVerification: this.rulesBlock.context.useMasterKey === true,
                            transaction: transaction
                        });
                        if (resultsObj) {
                            resultsObj[`ResultOf${deleteRule}`] = result;
                        } else {
                            this.results[`ResultOf${deleteRule}`] = result;
                        }

                    } else {
                        if (!data.filter) {
                            throw "filter field is required if you dont supply id field";
                        }
                        if (data.filter && Object.keys(data).length === 0) {
                            throw "Empty filter map is not supported in delete rule";
                        }
                        const query: any[] = await _databaseController.query(domain, data, this.rulesBlock.context, {
                            bypassDomainVerification: this.rulesBlock.context.useMasterKey === true,
                            transaction: transaction
                        });
                        const deleteResults = [];
                        if (query && Array.isArray(query)) {
                            for (const value of query) {
                                data.filter = {
                                    _id: value.id
                                };
                                const result = await _databaseController.delete(domain, data, this.rulesBlock.context, {
                                    bypassDomainVerification: this.rulesBlock.context.useMasterKey === true,
                                    transaction: transaction
                                });
                                deleteResults.push(result);
                            }
                        }
                        if (resultsObj) {
                            resultsObj[`ResultOf${deleteRule}`] = deleteResults;
                        } else {
                            this.results[`ResultOf${deleteRule}`] = deleteResults;
                        }
                    }
                } catch (e) {
                    this.results.errors.push({
                        message: e.message ? e.message : e.toString(),
                        path: `${transaction ? 'Transaction.' : ''}Delete.${domain}`,
                        data: data
                    });
                    if (transaction) {
                        throw e;
                    }
                }
            }
            return;
        } catch (e) {
            this.results.errors.push({
                message: e.message ? e.message : e.toString(),
                path: `${transaction ? 'Transaction.' : ''}Delete`,
                data: null
            });
            if (transaction) {
                throw e;
            }
            return;
        }
    }

    async handleQueryRules(rulesBlockModel?: RulesBlockModel, resultsObj?: object, transaction?: any): Promise<void> {
        try {
            const queryRules = this.getRulesKey(rulesBlockModel).filter(rule => rule.startsWith('Query'));
            if (queryRules.length === 0) {
                return;
            }
            for (const queryRule of queryRules) {
                const domain = this.extractDomain(queryRule, 'Query');
                const data = rulesBlockModel ? rulesBlockModel[queryRule] : this.rulesBlock[queryRule];
                // checkPermission
                const allowed = await _authController.hasPermission(`query.${domain}`, this.rulesBlock.context);
                if (allowed !== true) {
                    this.results.errors.push({
                        message: 'You have insufficient permission to this resource',
                        path: `${transaction ? 'Transaction.' : ''}Query.${domain}`,
                        data: data
                    });
                    return;
                }
                try {
                    if (data && Array.isArray(data)) {
                        this.results.errors.push({
                            message: 'Query data must be a map',
                            path: queryRule,
                            data: data,
                        });
                    } else {
                        const result = await _databaseController.query(domain, data, this.rulesBlock.context, {
                            bypassDomainVerification: this.rulesBlock.context.useMasterKey === true,
                            transaction: transaction
                        });
                        if (resultsObj) {
                            resultsObj[`ResultOf${queryRule}`] = result;
                        } else {
                            this.results[`ResultOf${queryRule}`] = result;
                        }
                    }
                } catch (e) {
                    this.results.errors.push({
                        message: e.message ? e.message : e.toString(),
                        path: `${transaction ? 'Transaction.' : ''}Query.${domain}`,
                        data: data
                    });
                    if (transaction) {
                        throw e;
                    }
                }
            }
            return;
        } catch (e) {
            this.results.errors.push({
                message: e.message ? e.message : e.toString(),
                path: `${transaction ? 'Transaction.' : ''}Query`,
                data: null
            });
            if (transaction) {
                throw e;
            }
            return;
        }
    }

    async handleTransactionRule(): Promise<void> {
        try {
            const transactionRules = this.getRulesKey().filter(rule => rule.startsWith('Transaction'));
            if (transactionRules.length === 0) {
                return;
            }
            const transactionRule = transactionRules[0];
            const transaction = this.rulesBlock[transactionRule];
            const transactionOperationRules = transaction.commit;
            const resultObject = {};
            await _databaseController.transaction(async session => {
                await this.handleCreateRules(transactionOperationRules, resultObject, session);
                await this.handleUpdateRules(transactionOperationRules, resultObject, session);
                await this.handleDeleteRules(transactionOperationRules, resultObject, session);
                await this.handleQueryRules(transactionOperationRules, resultObject, session);
            });
            this.results[`ResultOfTransaction`] = resultObject;
        } catch (e) {
            this.results.errors.push({
                message: e.message ? e.message : e.toString(),
                path: 'Transaction',
                data: null
            });
            return;
        }
    }

    async handleUpdateRules(rulesBlockModel?: RulesBlockModel, resultsObj?: object, transaction?: any): Promise<void> {
        try {
            const updateRules = this.getRulesKey(rulesBlockModel).filter(rule => rule.startsWith('Update'));
            if (updateRules.length === 0) {
                return;
            }
            for (const updateRule of updateRules) {
                const domain = this.extractDomain(updateRule, 'Update');
                const data: UpdateModel<any> = rulesBlockModel ? rulesBlockModel[updateRule] : this.rulesBlock[updateRule];
                // checkPermission
                const allowed = await _authController.hasPermission(`update.${domain}`, this.rulesBlock.context);
                if (allowed !== true) {
                    this.results.errors.push({
                        message: 'You have insufficient permission to this resource',
                        path: `${transaction ? 'Transaction.' : ''}Update.${domain}`,
                        data: data
                    });
                    return;
                }
                try {
                    if (Object.keys(data).length === 0) {
                        throw "Empty map is not supported in update rule";
                    }
                    if (!data.update) {
                        throw "Please update field is required, which contains properties to update a document"
                    }
                    if (data.id) {
                        const filter: any = {};
                        delete data.filter;
                        filter['_id'] = data.id;
                        data.filter = filter;
                        const result = await _databaseController.update(domain, data, this.rulesBlock.context, {
                            bypassDomainVerification: this.rulesBlock.context.useMasterKey === true,
                            transaction: transaction
                        });
                        if (resultsObj) {
                            resultsObj[`ResultOf${updateRule}`] = result;
                        } else {
                            this.results[`ResultOf${updateRule}`] = result
                        }
                    } else if (data.filter) {
                        const query: any[] = await _databaseController.query(domain, data, this.rulesBlock.context, {
                            bypassDomainVerification: this.rulesBlock.context.useMasterKey === true,
                            transaction: transaction
                        });
                        const updateResults = [];
                        if (query && Array.isArray(query)) {
                            for (const value of query) {
                                data.filter = {
                                    _id: value.id
                                };
                                const result = await _databaseController.update(domain, data, this.rulesBlock.context, {
                                    bypassDomainVerification: this.rulesBlock.context.useMasterKey === true,
                                    transaction: transaction
                                });
                                updateResults.push(result);
                            }
                        }
                        if (resultsObj) {
                            resultsObj[`ResultOf${updateRule}`] = updateResults;
                        } else {
                            this.results[`ResultOf${updateRule}`] = updateResults;
                        }
                    } else {
                        throw "Bad data format in update rule, no filter nor id";
                    }
                } catch (e) {
                    // console.log(e);
                    this.results.errors.push({
                        message: e.message ? e.message : e.toString(),
                        path: `${transaction ? 'Transaction.' : ''}Update.${domain}`,
                        data: data
                    });
                    if (transaction) {
                        throw e;
                    }
                }
            }
            return;
        } catch (e) {
            // console.log(e);
            this.results.errors.push({
                message: e.message ? e.message : e.toString(),
                path: `${transaction ? 'Transaction.' : ''}Update`,
                data: null
            });
            if (transaction) {
                throw e;
            }
            return;
        }
    }

    async handleAggregationRules(rulesBlockModel?: RulesBlockModel, resultsObj?: object, transaction?: any): Promise<void> {
        try {
            const aggregateRules = this.getRulesKey(rulesBlockModel).filter(rule => rule.startsWith('Aggregate'));
            if (aggregateRules.length === 0) {
                return;
            }
            if (!(this.rulesBlock.context && this.rulesBlock.context.useMasterKey === true)) {
                this.results.errors.push({
                    message: 'Aggregate rule require masterKey',
                    path: 'Aggregate',
                    data: null
                });
                return;
            }
            for (const aggregateRule of aggregateRules) {
                const domain = this.extractDomain(aggregateRule, 'Aggregate');
                const data = rulesBlockModel ? rulesBlockModel[aggregateRule] : this.rulesBlock[aggregateRule];
                try {
                    if (!(data && Array.isArray(data))) {
                        throw {message: "A pipeline must be an array"};
                    }
                    const result = await _databaseController.aggregate(domain, data, this.rulesBlock.context, {
                        bypassDomainVerification: true,
                        transaction: transaction
                    });
                    if (resultsObj) {
                        resultsObj[`ResultOf${aggregateRule}`] = result;
                    } else {
                        this.results[`ResultOf${aggregateRule}`] = result;
                    }

                } catch (e) {
                    this.results.errors.push({
                        message: e.message ? e.message : e.toString(),
                        path: `${transaction ? 'Transaction.' : ''}Aggregate.${domain}`,
                        data: data
                    });
                    if (transaction) {
                        throw e;
                    }
                }
            }
            return;
        } catch (e) {
            this.results.errors.push({
                message: e.message ? e.message : e.toString(),
                path: `${transaction ? 'Transaction.' : ''}Aggregate`,
                data: null
            });
            if (transaction) {
                throw e;
            }
            return;
        }
    }

    async handleStorageRule(): Promise<void> {
        try {
            const fileRules = this.getRulesKey().filter(rule => rule.startsWith('Files'));
            if (fileRules.length === 0) {
                return;
            }
            const fileRule = fileRules[0];
            const file = this.rulesBlock[fileRule];
            for (const action of Object.keys(file)) {
                const data = file[action];
                try {
                    if (action === 'save') {
                        // checkPermission
                        const allowed = await _authController.hasPermission(`files.save`, this.rulesBlock.context);
                        if (allowed !== true) {
                            this.results.errors.push({
                                message: 'You have insufficient permission save file',
                                path: `Files.save`,
                                data: data
                            });
                        } else {
                            this.results["ResultOfFiles"] = {};
                            this.results["ResultOfFiles"].save = await _storageController.save(data, this.rulesBlock.context);
                        }
                    } else if (action === 'delete') {
                        const allowed = await _authController.hasPermission(`files.delete`, this.rulesBlock.context);
                        if (allowed !== true) {
                            this.results.errors.push({
                                message: 'You have insufficient permission delete file',
                                path: `Files.delete`,
                                data: data
                            });
                        } else {
                            this.results["ResultOfFiles"] = {};
                            this.results["ResultOfFiles"].delete = await _storageController.delete(data, this.rulesBlock.context);
                        }
                    }
                    // if (action === 'list') {
                    //     this.results["ResultOfAuthentication"] = {};
                    //     this.results["ResultOfAuthentication"].resetPassword = await _authController.resetPassword(data.email ? data.email : data);
                    // }
                } catch (e) {
                    this.results.errors.push({
                        message: e.message ? e.message : e.toString(),
                        path: `Files.${action}`,
                        data: data
                    });
                }
            }
            return;
        } catch (e) {
            this.results.errors.push({
                message: e.message ? e.message : e.toString(),
                path: 'Files',
                data: null
            });
            return;
        }
    }

    extractDomain(rule: string, remove: 'Create' | 'Query' | 'Update' | 'Delete' | 'Aggregate'): string {
        return rule.replace(remove, '');
    }

}
