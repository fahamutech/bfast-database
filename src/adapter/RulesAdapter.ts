import {RulesBlockModel} from "../model/RulesBlockModel";

export interface RulesAdapter {
    rulesBlock: RulesBlockModel;
    results: RulesBlockModel;

    extractDomain(rule: string, remove: 'Create' | 'Query' | 'Update' | 'Delete'): string;

    handleCreateRules(): Promise<void>;

    handleQueryRules(): Promise<void>;

    handleDeleteRules(): Promise<void>;

    handleUpdateRules(): Promise<void>;

    handleTransactionRule(): Promise<void>;

    handleAuthenticationRule(): Promise<void>;

    handleAuthorizationRule(): Promise<void>;
}
