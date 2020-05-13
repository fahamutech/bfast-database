import {DatabaseAdapter} from "../adapter/DatabaseAdapter";
import {AuthAdapter} from "../adapter/AuthAdapter";
import {RestAdapter} from "../adapter/RestAdapter";
import {SecurityAdapter} from "../adapter/SecurityAdapter";
import {RulesAdapter} from "../adapter/RulesAdapter";

export class DaaSConfig implements ConfigAdapter {
    private static instance: DaaSConfig;

    private constructor() {
    }

    static getInstance(): DaaSConfig {
        if (this.instance) {
            return this.instance;
        } else {
            this.instance = new DaaSConfig();
            return this.instance;
        }
    }

    addValues(config: ConfigAdapter) {
        Object.assign(this, config);
    }

    applicationId: string;
    masterKey: string;
    mountPath: string;
    mongoDbUri?: string;
    port: string;
    adapters?: {
        database?: (config: ConfigAdapter) => DatabaseAdapter,
        auth?: (config: ConfigAdapter) => AuthAdapter,
        rest?: (config: ConfigAdapter) => RestAdapter,
        security?: (config: ConfigAdapter) => SecurityAdapter,
        rules?: (config: ConfigAdapter) => RulesAdapter
    }
}


export interface ConfigAdapter {
    port: string;
    masterKey: string;
    applicationId: string;
    mountPath: string;
    mongoDbUri?: string;
    adapters?: {
        database?: (config: ConfigAdapter) => DatabaseAdapter,
        auth?: (config: ConfigAdapter) => AuthAdapter,
        rest?: (config: ConfigAdapter) => RestAdapter,
        security?: (config: ConfigAdapter) => SecurityAdapter,
        rules?: (config: ConfigAdapter) => RulesAdapter
    }
}
