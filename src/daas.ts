import {DaaSAdapter} from "./adapter/DaaSAdapter";
import {FaaS} from 'bfast-faas';
import {Database} from "./factory/Database";
import {DatabaseController} from "./controllers/DatabaseController";
import {SecurityController} from "./controllers/SecurityController";
import {ConfigAdapter, DaaSConfig} from "./config";


export class DaaSServer implements DaaSAdapter {
    private faas: FaaS;

    constructor() {
        DaaSServer._registerOptions(config);
    }

    /**
     * start a bfast::database server
     * @param options {ConfigAdapter}
     * @return Promise
     */
    async start(options: ConfigAdapter): Promise<boolean> {
        if (this._validateOptions(options).valid) {
            this.faas = new FaaS({
                port: options.port,
                functionsConfig: {
                    functionsDirPath: __dirname,
                    bfastJsonPath: __dirname + '/bfast.json'
                }
            });
            await this.faas.start();
            await this._setUpDatabase(this.config);
            return true;
        } else {
            throw new Error(this._validateOptions(options).message);
        }
    }

    /**
     * stop a bfast::database server
     * @return Promise
     */
    async stop(): Promise<any> {
        if (!this.faas){
            return true;
        }
        return this.faas.stop();
    }

    private _validateOptions(options: ConfigAdapter): { valid: boolean, message: string } {
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

    private  async _setUpDatabase(config: ConfigAdapter) {
        const database: DatabaseController = new DatabaseController(
            (config && config.adapters && config.adapters.database)
            ? config.adapters.database(config)
            : new Database(),
            new SecurityController()
        )
        return database.init();
    }

    private  _registerOptions(options: ConfigAdapter) {
        DaaSConfig.getInstance().addValues(options);
    }
}
