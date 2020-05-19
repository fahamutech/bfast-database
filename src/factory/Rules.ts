import {RulesAdapter} from "../adapter/RulesAdapter";
import {RulesBlockModel} from "../model/RulesBlockModel";
import {DatabaseAdapter} from "../adapter/DatabaseAdapter";
import {ConfigAdapter} from "../utils/config";
import {Database} from "./Database";
import {AuthAdapter} from "../adapter/AuthAdapter";
import {Auth} from "./Auth";
import {UpdateModel} from "../model/UpdateModel";
import {DeleteModel} from "../model/DeleteModel";

let database: DatabaseAdapter;
let auth: AuthAdapter;

export class Rules implements RulesAdapter {
    rulesBlock: RulesBlockModel;
    results: RulesBlockModel = {errors: []};

    constructor(private readonly config: ConfigAdapter) {
        database = (config.adapters && config.adapters.database) ?
            this.config.adapters.database(config) : new Database(config);
        auth = (config.adapters && config.adapters.auth) ?
            this.config.adapters.auth(config) : new Auth(config);
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
                        this.results["ResultOfAuthentication"].signUp = await auth.signUp(data, this.rulesBlock.context);
                    }
                    if (action === 'signIn') {
                        this.results["ResultOfAuthentication"] = {};
                        this.results["ResultOfAuthentication"].signIn = await auth.signIn(data, this.rulesBlock.context);
                    }
                    if (action === 'resetPassword') {
                        this.results["ResultOfAuthentication"] = {};
                        this.results["ResultOfAuthentication"].resetPassword = await auth.resetPassword(data.email ? data.email : data);
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

    handleAuthorizationRule(): Promise<void> {
        return;
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
                try {
                    if (data && Array.isArray(data)) {
                        const result = await database.writeMany(domain, data, this.rulesBlock.context, {
                            bypassDomainVerification: this.rulesBlock.context.useMasterKey === true,
                            transaction: transaction
                        });
                        if (resultsObj) {
                            resultsObj[`ResultOf${createRule}`] = result;
                        } else {
                            this.results[`ResultOf${createRule}`] = result
                        }
                    } else {
                        const result = await database.writeOne(domain, data, this.rulesBlock.context, {
                            bypassDomainVerification: this.rulesBlock.context.useMasterKey === true,
                            transaction: transaction
                        });
                        if (resultsObj) {
                            resultsObj[`ResultOf${createRule}`] = result;
                        } else {
                            this.results[`ResultOf${createRule}`] = result
                        }
                    }
                } catch (e) {
                    this.results.errors.push({
                        message: e.message ? e.message : e.toString(),
                        path: `Create.${domain}`,
                        data: data
                    });
                }
            }
            return;
        } catch (e) {
            this.results.errors.push({
                message: e.message ? e.message : e.toString(),
                path: 'Create',
                data: null
            });
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
                try {
                    if (data.id) {
                        const filter: any = {};
                        delete data.filter;
                        filter['_id'] = data.id;
                        data.filter = filter;
                        const result = await database.deleteOne(domain, data, this.rulesBlock.context, {
                            bypassDomainVerification: this.rulesBlock.context.useMasterKey === true,
                            transaction: transaction
                        });
                        if (resultsObj) {
                            resultsObj[`ResultOf${deleteRule}`] = result;
                        } else {
                            this.results[`ResultOf${deleteRule}`] = result;
                        }
                    } else {
                        const query: any[] = await database.query(domain, data, this.rulesBlock.context, {
                            bypassDomainVerification: this.rulesBlock.context.useMasterKey === true,
                            transaction: transaction
                        });
                        const deleteResults = [];
                        if (query && Array.isArray(query)) {
                            for (const value of query) {
                                data.filter = {
                                    _id: value.id
                                };
                                const result = await database.deleteOne(domain, data, this.rulesBlock.context, {
                                    bypassDomainVerification: this.rulesBlock.context.useMasterKey === true,
                                    transaction: transaction
                                });
                                if (result) {
                                    deleteResults.push(result);
                                }
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
                        path: `Delete.${domain}`,
                        data: data
                    });
                }
            }
            return;
        } catch (e) {
            this.results.errors.push({
                message: e.message ? e.message : e.toString(),
                path: 'Delete',
                data: null
            });
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
                try {
                    if (data && Array.isArray(data)) {
                        this.results.errors.push({
                            message: 'Query data must be a map',
                            path: queryRule,
                            data: data,
                        });
                    } else {
                        const result = await database.query(domain, data, this.rulesBlock.context, {
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
                        path: `Query.${domain}`,
                        data: data
                    });
                }
            }
            return;
        } catch (e) {
            this.results.errors.push({
                message: e.message ? e.message : e.toString(),
                path: 'Query',
                data: null
            });
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
            await database.transaction(session => {
                return Promise.all([
                    this.handleCreateRules(transactionOperationRules, resultObject, session)
                ]);
            })
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
                try {
                    if (data.id) {
                        const filter: any = {};
                        delete data.filter;
                        filter['_id'] = data.id;
                        data.filter = filter;
                        const result = await database.updateOne(domain, data, this.rulesBlock.context, {
                            bypassDomainVerification: this.rulesBlock.context.useMasterKey === true,
                            transaction: transaction
                        });
                        if (resultsObj) {
                            resultsObj[`ResultOf${updateRule}`] = result;
                        } else {
                            this.results[`ResultOf${updateRule}`] = result
                        }
                    } else {
                        const query: any[] = await database.query(domain, data, this.rulesBlock.context, {
                            bypassDomainVerification: this.rulesBlock.context.useMasterKey === true,
                            transaction: transaction
                        });
                        const updateResults = [];
                        if (query && Array.isArray(query)) {
                            for (const value of query) {
                                data.filter = {
                                    _id: value.id
                                };
                                const result = await database.updateOne(domain, data, this.rulesBlock.context, {
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
                    }
                } catch (e) {
                    this.results.errors.push({
                        message: e.message ? e.message : e.toString(),
                        path: `Update.${domain}`,
                        data: data
                    });
                }
            }
            return;
        } catch (e) {
            this.results.errors.push({
                message: e.message ? e.message : e.toString(),
                path: 'Update',
                data: null
            });
            return;
        }
    }

    extractDomain(rule: string, remove: 'Create' | 'Query' | 'Update' | 'Delete'): string {
        return rule.replace(remove, '');
    }

}
