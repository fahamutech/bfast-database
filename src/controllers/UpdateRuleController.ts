// import {RulesModel} from "bfastnode/dist/model/RulesModel";
// import {UpdateModel} from "../model/UpdateModel";
// import {DatabaseController} from "./DatabaseController";
// import {RulesBlockModel} from "../model/RulesBlockModel";
//
// export class UpdateRuleController {
//
//     async updateById(domain: string,
//                      updateRule: string,
//                      updateRuleBlock: UpdateModel<any>,
//                      ruleResultModel: RulesModel,
//                      rulesBlockModel: RulesBlockModel,
//                      _databaseController: DatabaseController,
//                      transactionSession) {
//         const filter: any = {};
//         delete updateRuleBlock.filter;
//         filter['_id'] = updateRuleBlock.id;
//         updateRuleBlock.filter = filter;
//         ruleResultModel[updateRule]
//             = await _databaseController.update(domain, updateRuleBlock, rulesBlockModel?.context, {
//             bypassDomainVerification: rulesBlockModel?.context?.useMasterKey === true,
//             transaction: transactionSession
//         });
//     }
// }
