import {DatabaseAdapter} from "./adapter/DatabaseAdapter";
import {AuthAdapter} from "./adapter/AuthAdapter";
import {EmailAdapter} from "./adapter/EmailAdapter";

export class BFastDatabaseConfig implements BFastDatabaseConfigAdapter {
    private static instance: BFastDatabaseConfig;

    private constructor() {
    }

    static getInstance(): BFastDatabaseConfig {
        if (this.instance) {
            return this.instance;
        } else {
            this.instance = new BFastDatabaseConfig();
            return this.instance;
        }
    }

    addValues(config: BFastDatabaseConfigAdapter) {
        Object.assign(this, config);
    }

    applicationId: string;
    masterKey: string;
    mountPath: string;
    mongoDbUri?: string;
    port: string;
    adapters?: {
        database?: (config: BFastDatabaseConfigAdapter) => DatabaseAdapter;
        auth?: (config: BFastDatabaseConfigAdapter) => AuthAdapter;
        email?: (config: BFastDatabaseConfigAdapter) => EmailAdapter;
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


export interface BFastDatabaseConfigAdapter {
    port: string;
    masterKey?: string;
    applicationId: string;
    mountPath: string;
    mongoDbUri?: string;
    adapters?: {
        database?: (config: BFastDatabaseConfigAdapter) => DatabaseAdapter;
        auth?: (config: BFastDatabaseConfigAdapter) => AuthAdapter;
        email?: (config: BFastDatabaseConfigAdapter) => EmailAdapter;
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
