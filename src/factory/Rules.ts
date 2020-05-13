import {RulesAdapter} from "../adapter/RulesAdapter";
import {RulesBlockModel} from "../model/RulesBlockModel";
import {DatabaseAdapter} from "../adapter/DatabaseAdapter";
import {ConfigAdapter} from "../config";
import {Database} from "./Database";

let database: DatabaseAdapter;

export class Rules implements RulesAdapter {
    rulesBlock: RulesBlockModel;
    results: RulesBlockModel = {errors: []};

    constructor(private readonly config: ConfigAdapter) {
        database = (config.adapters && config.adapters.database) ?
            this.config.adapters.database(config) : new Database(config);
    }

    // const queryRules = rules.filter(rule => rule.toLowerCase().startsWith('query'));
    // const updateRules = rules.filter(rule => rule.toLowerCase().startsWith('update'));
    // const deleteRules = rules.filter(rule => rule.toLowerCase().startsWith('delete'));
    // const transactionRule = rules.filter(rule => rule.toLowerCase().startsWith('transaction'));
    // const authenticationRule = rules.filter(rule => rule.toLowerCase().startsWith('authentication'));
    // const authorizationRule = rules.filter(rule => rule.toLowerCase().startsWith('authorization'));

    private getRulesKey(): string[] {
        if (this.rulesBlock) {
            return Object.keys(this.rulesBlock);
        } else {
            return Object.keys({});
        }
    }

    handleAuthenticationRule(): Promise<void> {
        return Promise.resolve(undefined);
    }

    handleAuthorizationRule(): Promise<void> {
        return Promise.resolve(undefined);
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
        return Promise.resolve(undefined);
    }

    handleQueryRules(): Promise<void> {
        return Promise.resolve(undefined);
    }

    handleTransactionRule(): Promise<void> {
        return Promise.resolve(undefined);
    }

    handleUpdateRules(): Promise<void> {
        return Promise.resolve(undefined);
    }

    extractDomain(rule: string, remove: 'Create' | 'Query' | 'Update' | 'Delete'): string {
        return rule.replace(remove, '');
    }

}
