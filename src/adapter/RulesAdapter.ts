// import {RulesBlockModel} from "../model/RulesBlockModel";
//
// export interface RulesAdapter {
//     // rulesBlock: RulesBlockModel;
//     results: RulesBlockModel;
//
//     extractDomain(rule: string, remove: 'Create' | 'Query' | 'Update' | 'Delete'): string;
//
//     handleCreateRules(rulesBlockModel: RulesBlockModel, resultsObj?: object, transaction?: any): Promise<void>;
//
//     handleQueryRules(rulesBlockModel: RulesBlockModel, resultsObj?: object, transaction?: any): Promise<void>;
//
//     handleAggregationRules(rulesBlockModel: RulesBlockModel, resultsObj?: object, transaction?: any): Promise<void>;
//
//     handleDeleteRules(rulesBlockModel: RulesBlockModel, resultsObj?: object, transaction?: any): Promise<void>;
//
//     handleUpdateRules(rulesBlockModel: RulesBlockModel, resultsObj?: object, transaction?: any): Promise<void>;
//
//     handleTransactionRule(rulesBlockModel: RulesBlockModel): Promise<void>;
//
//     handleAuthenticationRule(rulesBlockModel: RulesBlockModel): Promise<void>;
//
//     handleAuthorizationRule(rulesBlockModel: RulesBlockModel): Promise<void>;
//
//     handleStorageRule(rulesBlockModel: RulesBlockModel): Promise<void>;
// }
