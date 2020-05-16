import { AuthAdapter } from "../adapter/AuthAdapter";
import { ConfigAdapter } from "../config";
import { BasicUserAttributes } from "../model/BasicUserAttributes";
import { ContextBlock } from "../model/RulesBlockModel";
export declare class Auth implements AuthAdapter {
    private readonly config;
    private domainName;
    constructor(config: ConfigAdapter);
    resetPassword(email: string): Promise<any>;
    signIn<T extends BasicUserAttributes>(userModel: T, context?: ContextBlock): Promise<T>;
    signUp<T extends BasicUserAttributes>(userModel: T, context?: ContextBlock): Promise<T>;
    private static validateData;
}
