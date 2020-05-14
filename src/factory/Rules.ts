import {RulesAdapter} from "../adapter/RulesAdapter";
import {RulesBlockModel} from "../model/RulesBlockModel";
import {DatabaseAdapter} from "../adapter/DatabaseAdapter";
import {ConfigAdapter} from "../config";
import {Database} from "./Database";
import {AuthAdapter} from "../adapter/AuthAdapter";
import {Auth} from "./Auth";

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

    private getRulesKey(): string[] {
        if (this.rulesBlock) {
            return Object.keys(this.rulesBlock);
        } else {
            return Object.keys({});
        }
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
                console.log(action);
                try {
                    if (action === 'signUp') {
                        this.results["Authentication"] = {};
                        this.results["Authentication"].signUp = await auth.signUp(authentication[action], this.rulesBlock.context);
                    }
                    if (action === 'signIn') {
                        this.results["Authentication"].signIn = await auth.signIn(authentication[action], this.rulesBlock.context);
                    }
                    if (action === 'resetPassword') {
                        this.results["Authentication"].resetPassword = await auth.resetPassword(authentication[action].email);
                    }
                } catch (e) {
                    this.results.errors.push({
                        message: e.message ? e.message : e.toString(),
                        path: authenticationRule[action]
                    });
                }
            }
            return;
        } catch (e) {
            this.results.errors.push({
                message: e.message ? e.message : e.toString()
            });
            return;
        }
    }

    handleAuthorizationRule(): Promise<void> {
        return;
    }

    async handleCreateRules(): Promise<void> {
        try {
            const createRules = this.getRulesKey().filter(rule => rule.startsWith('Create'));
            if (createRules.length === 0) {
                return;
            }
            for (const createRule of createRules) {
                try {
                    const domain = this.extractDomain(createRule, 'Create');
                    const data = this.rulesBlock[createRule];
                    if (data && Array.isArray(data)) {
                        this.results[domain] = await database.writeMany(domain, data, this.rulesBlock.context);
                    } else {
                        this.results[domain] = await database.writeOne(domain, data, this.rulesBlock.context);
                    }
                } catch (e) {
                    this.results.errors.push({
                        message: e.message ? e.message : e.toString(),
                        path: createRule
                    });
                }
            }
            return;
        } catch (e) {
            this.results.errors.push({
                message: e.message ? e.message : e.toString()
            });
            return;
        }
    }

    handleDeleteRules(): Promise<void> {
        return;
    }

    async handleQueryRules(): Promise<void> {
        try {
            const queryRules = this.getRulesKey().filter(rule => rule.startsWith('Query'));
            if (queryRules.length === 0) {
                return;
            }
            for (const queryRule of queryRules) {
                try {
                    const domain = this.extractDomain(queryRule, 'Query');
                    const data = this.rulesBlock[queryRule];
                    if (data && Array.isArray(data)) {
                        this.results.errors.push({
                            message: 'Query data must be a map',
                            path: queryRule
                        });
                    } else {
                        this.results[domain] = await database.query(domain, data, this.rulesBlock.context);
                    }
                } catch (e) {
                    this.results.errors.push({
                        message: e.message ? e.message : e.toString(),
                        path: queryRule
                    });
                }
            }
            return;
        } catch (e) {
            this.results.errors.push({
                message: e.message ? e.message : e.toString()
            });
            return;
        }
    }

    handleTransactionRule(): Promise<void> {
        return;
    }

    handleUpdateRules(): Promise<void> {
        return;
    }

    extractDomain(rule: string, remove: 'Create' | 'Query' | 'Update' | 'Delete'): string {
        return rule.replace(remove, '');
    }

}
