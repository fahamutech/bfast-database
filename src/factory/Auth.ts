import {AuthAdapter} from "../adapter/AuthAdapter";
import {ConfigAdapter} from "../config";
import {BasicUserAttributes} from "../model/BasicUserAttributes";
import {DatabaseAdapter} from "../adapter/DatabaseAdapter";
import {Database} from "./Database";

let database: DatabaseAdapter;

export class Auth implements AuthAdapter {
    constructor(private readonly config: ConfigAdapter) {
        database = (config.adapters && config.adapters.database) ?
            config.adapters.database(config) : new Database(config);
    }

    resetPassword(email: string): Promise<any> {
        return Promise.resolve(undefined);
    }

    signIn<T extends BasicUserAttributes>(userModel: T): Promise<T> {
        return Promise.resolve(undefined);
    }

    signUp<T extends BasicUserAttributes>(userModel: T): Promise<T> {
        return Promise.resolve(undefined);
    }
}
