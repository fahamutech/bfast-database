import { RulesAdapter } from "../adapter/RulesAdapter";
import { RulesBlockModel } from "../model/RulesBlockModel";
import { ConfigAdapter } from "../config";
export declare class Rules implements RulesAdapter {
    private readonly config;
    rulesBlock: RulesBlockModel;
    results: RulesBlockModel;
    constructor(config: ConfigAdapter);
    private getRulesKey;
    handleAuthenticationRule(): Promise<void>;
    handleAuthorizationRule(): Promise<void>;
    handleCreateRules(): Promise<void>;
    handleDeleteRules(): Promise<void>;
    handleQueryRules(): Promise<void>;
    handleTransactionRule(): Promise<void>;
    handleUpdateRules(): Promise<void>;
    extractDomain(rule: string, remove: 'Create' | 'Query' | 'Update' | 'Delete'): string;
}
