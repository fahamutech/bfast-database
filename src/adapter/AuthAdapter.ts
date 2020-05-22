import {BasicUserAttributes} from "../model/BasicUserAttributes";
import {ContextBlock} from "../model/RulesBlockModel";

export interface AuthAdapter {
    signUp<T extends BasicUserAttributes>(userModel: T, context?: ContextBlock,): Promise<T>;

    signIn<T extends BasicUserAttributes>(userModel: T, context?: ContextBlock,): Promise<T>;

    resetPassword(email: string): Promise<any>;

    // updatePassword()

    addAuthorizationRule(ruleId:string,rule:string, context: ContextBlock):Promise<any>;

    hasPermission(ruleId:string,context: ContextBlock):Promise<boolean>;
}
