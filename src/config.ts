import {DatabaseAdapter} from "./adapter/DatabaseAdapter";
import {AuthAdapter} from "./adapter/AuthAdapter";
import {EmailAdapter} from "./adapter/EmailAdapter";

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
        database?: (config: ConfigAdapter) => DatabaseAdapter;
        auth?: (config: ConfigAdapter) => AuthAdapter;
        email?: (config: ConfigAdapter) => EmailAdapter;
        s3Storage?: {
            accessKey: string;
            bucket: string;
            direct: boolean;
            endPoint: string;
            prefix?: string;
            region?: string;
            useSSL?: boolean;
            secretKey: string;
        } | undefined;
    }
}


export interface ConfigAdapter {
    port: string;
    masterKey?: string;
    applicationId: string;
    mountPath: string;
    mongoDbUri?: string;
    adapters?: {
        database?: (config: ConfigAdapter) => DatabaseAdapter;
        auth?: (config: ConfigAdapter) => AuthAdapter;
        email?: (config: ConfigAdapter) => EmailAdapter;
        s3Storage?: {
            accessKey: string;
            bucket: string;
            direct: boolean;
            endPoint: string;
            prefix?: string;
            region?: string;
            useSSL?: boolean;
            secretKey: string;
        } | undefined;
    }
}
