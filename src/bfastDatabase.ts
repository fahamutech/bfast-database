import {BfastFunctions} from 'bfast-faas';
import {Database} from "./factory/Database";
import {DatabaseController} from "./controllers/DatabaseController";
import {SecurityController} from "./controllers/SecurityController";
import {BFastDatabaseConfig, BFastDatabaseConfigAdapter} from "./bfastDatabaseConfig";


export class BFastDatabase {
    private bfastFunctions: BfastFunctions;

    /**
     * start a bfast::database server
     * @param options {BFastDatabaseConfig}
     * @return Promise
     */
    async start(options: BFastDatabaseConfigAdapter): Promise<boolean> {
        if (BFastDatabase._validateOptions(options).valid) {
            BFastDatabase._registerOptions(options);
            this.bfastFunctions = new BfastFunctions({
                port: options.port,
                functionsConfig: {
                    functionsDirPath: __dirname,
                    bfastJsonPath: __dirname + '/bfast.json'
                }
            });
            await this.bfastFunctions.start();
            BFastDatabase._setUpDatabase(options).catch(reason => console.warn(reason.toString()));
            return true;
        } else {
            throw new Error(BFastDatabase._validateOptions(options).message);
        }
    }

    /**
     * stop a bfast::database server
     * @return Promise
     */
    async stop(): Promise<any> {
        if (!this.bfastFunctions) {
            return true;
        }
        return this.bfastFunctions.stop();
    }

    private static _validateOptions(options: BFastDatabaseConfigAdapter): { valid: boolean, message: string } {
        // if (!options.mountPath) {
        //     options.mountPath = '/';
        // }
        if (!options.port) {
            return {
                valid: false,
                message: 'Port option required'
            }
        } else if (false /*!options.mountPath*/) {
            return {
                valid: false,
                message: 'Mount Path required'
            }
        } else if (false /*options?.mountPath === '/storage' || options?.mountPath === '/changes'*/) {
            return {
                valid: false,
                message: 'Mount path name not supported'
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

    private static async _setUpDatabase(config: BFastDatabaseConfigAdapter) {
        const database: DatabaseController = new DatabaseController(
            (config && config.adapters && config.adapters.database)
                ? config.adapters.database(config)
                : new Database(config),
            new SecurityController()
        )
        return database.init();
    }

    private static _registerOptions(options: BFastDatabaseConfigAdapter) {
        BFastDatabaseConfig.getInstance().addValues(options);
    }
}
