import {BasicUserAttributes} from "../model/BasicUserAttributes";
import {ContextBlock} from "../model/RulesBlockModel";

export interface AuthAdapter {
    signUp<T extends BasicUserAttributes>(userModel: T, context?: ContextBlock): Promise<T>;

    signIn<T extends BasicUserAttributes>(userModel: T, context?: ContextBlock): Promise<T>;

    resetPassword(email: string, context?: ContextBlock): Promise<any>;

    updatePassword(password: string, context?: ContextBlock): Promise<any>;

    deleteUser(context?: ContextBlock): Promise<any>;

    update<T extends BasicUserAttributes>(userModel: T, context?: ContextBlock): Promise<T>;

    sendVerificationEmail(email: string, context?: ContextBlock): Promise<any>;

    // addAuthorizationRule(ruleId: string, rule: string, context: ContextBlock): Promise<any>;

   // hasPermission(ruleId: string, context: ContextBlock): Promise<boolean>;
}
