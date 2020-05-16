import { DatabaseAdapter } from "../adapter/DatabaseAdapter";
import { AuthAdapter } from "../adapter/AuthAdapter";
import { RestAdapter } from "../adapter/RestAdapter";
import { SecurityAdapter } from "../adapter/SecurityAdapter";
import { RulesAdapter } from "../adapter/RulesAdapter";
import { EmailAdapter } from "../adapter/EmailAdapter";
export declare class DaaSConfig implements ConfigAdapter {
    private static instance;
    private constructor();
    static getInstance(): DaaSConfig;
    addValues(config: ConfigAdapter): void;
    applicationId: string;
    masterKey: string;
    mountPath: string;
    mongoDbUri?: string;
    port: string;
    adapters?: {
        database?: (config: ConfigAdapter) => DatabaseAdapter;
        auth?: (config: ConfigAdapter) => AuthAdapter;
        rest?: (config: ConfigAdapter) => RestAdapter;
        security?: (config: ConfigAdapter) => SecurityAdapter;
        rules?: (config: ConfigAdapter) => RulesAdapter;
        email?: (config: ConfigAdapter) => EmailAdapter;
    };
}
export interface ConfigAdapter {
    port: string;
    masterKey: string;
    applicationId: string;
    mountPath: string;
    mongoDbUri?: string;
    adapters?: {
        database?: (config: ConfigAdapter) => DatabaseAdapter;
        auth?: (config: ConfigAdapter) => AuthAdapter;
        rest?: (config: ConfigAdapter) => RestAdapter;
        security?: (config: ConfigAdapter) => SecurityAdapter;
        rules?: (config: ConfigAdapter) => RulesAdapter;
        email?: (config: ConfigAdapter) => EmailAdapter;
    };
}
