import {DaaSAdapter} from "./adapter/DaaSAdapter";
import {FaaS} from 'bfast-faas';
import {ConfigAdapter, DaaSConfig} from "./config";
import {Database} from "./factory/Database";


export class DaaSServer implements DaaSAdapter {
    private faas: FaaS;

    constructor(private readonly config: ConfigAdapter) {
        DaaSServer.registerOptions(config);
    }

    async start(): Promise<boolean> {
        if (this.validateOptions().valid) {
            this.faas = new FaaS({
                port: this.config.port,
                functionsConfig: {
                    functionsDirPath: __dirname,
                    bfastJsonPath: __dirname + '/config/bfast.json'
                }
            });
            await this.faas.start();
            await DaaSServer.setUpDatabase(this.config);
            return true;
        } else {
            throw new Error(this.validateOptions().message);
        }
    }

    async stop(): Promise<boolean> {
        process.exit(0);
        return true;
    }

    private validateOptions(): { valid: boolean, message: string } {
        const options = this.config;
        if (!options.port) {
            return {
                valid: false,
                message: 'Port option required'
            }
        } else if (!options.mountPath) {
            return {
                valid: false,
                message: 'Mount Path required'
            }
        } else if (!options.masterKey) {
            return {
                valid: false,
                message: 'MasterKey required'
            }
        } else {
            if (!options.mongoDbUri) {
                if (!options.adapters && !options.adapters?.database) {
                    return {
                        valid: false,
                        message: 'mongoDbUri required, or supply database adapter instead'
                    }
                }
            }
            return {
                valid: true,
                message: 'no issues'
            }
        }
    }

    private static async setUpDatabase(config: ConfigAdapter) {
        const database: any = (config.adapters && config.adapters.database) ?
            config.adapters.database(config) : new Database(config);
        return database.init();
    }

    private static registerOptions(options: ConfigAdapter) {
        DaaSConfig.getInstance().addValues(options);
    }
}
