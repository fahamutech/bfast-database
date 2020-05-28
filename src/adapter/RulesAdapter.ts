import {RulesBlockModel} from "../model/RulesBlockModel";

export interface RulesAdapter {
    rulesBlock: RulesBlockModel;
    results: RulesBlockModel;

    extractDomain(rule: string, remove: 'Create' | 'Query' | 'Update' | 'Delete'): string;

    handleCreateRules(rulesBlockModel?: RulesBlockModel, resultsObj?: object, transaction?: any): Promise<void>;

    handleQueryRules(rulesBlockModel?: RulesBlockModel, resultsObj?: object, transaction?: any): Promise<void>;

    handleAggregationRules(rulesBlockModel?: RulesBlockModel, resultsObj?: object, transaction?: any): Promise<void>;

    handleDeleteRules(rulesBlockModel?: RulesBlockModel, resultsObj?: object, transaction?: any): Promise<void>;

    handleUpdateRules(rulesBlockModel?: RulesBlockModel, resultsObj?: object, transaction?: any): Promise<void>;

    handleTransactionRule(): Promise<void>;

    handleAuthenticationRule(): Promise<void>;

    handleAuthorizationRule(): Promise<void>;

    handleStorageRule(): Promise<void>;
}
