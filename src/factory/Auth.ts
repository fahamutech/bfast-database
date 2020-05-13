import {AuthAdapter} from "../adapter/AuthAdapter";
import {ConfigAdapter} from "../config";
import {BasicUserAttributes} from "../model/BasicUserAttributes";
import {DatabaseAdapter} from "../adapter/DatabaseAdapter";
import {Database} from "./Database";
import {ContextBlock} from "../model/RulesBlockModel";
import {SecurityAdapter} from "../adapter/SecurityAdapter";
import {Security} from "./Security";

let database: DatabaseAdapter;
let security: SecurityAdapter;

export class Auth implements AuthAdapter {
    private domainName = '_User';

    constructor(private readonly config: ConfigAdapter) {
        database = (config.adapters && config.adapters.database) ?
            config.adapters.database(config) : new Database(config);
        security = (config.adapters && config.adapters.security) ?
            config.adapters.security(config) : new Security(config);
    }

    async resetPassword(email: string): Promise<any> {
        if (!email) {
            throw new Error('Email required');
        }
        throw new Error('Not implemented');
    }

    async signIn<T extends BasicUserAttributes>(userModel: T, context?: ContextBlock): Promise<T> {
        Auth.validateData(userModel);
        userModel.return = [];
        throw new Error('Not implemented');
    }

    async signUp<T extends BasicUserAttributes>(userModel: T, context?: ContextBlock): Promise<T> {
        Auth.validateData(userModel);
        userModel.return = [];
        userModel.password = await security.hashPlainText(userModel.password);
        const user = await database.writeOne<BasicUserAttributes, any>(this.domainName, userModel, context, {
            bypassDomainVerification: true,
            indexes: [
                {
                    field: 'email',
                    unique: true,
                    collation: {
                        locale: 'en',
                        strength: 2
                    }
                },
                {
                    field: 'username',
                    unique: true,
                    collation: {
                        locale: 'en',
                        strength: 2
                    }
                }
            ]
        });
        delete user.password;
        user.token = await security.generateToken({uid:user.id});
        return user;
    }

    private static validateData<T extends BasicUserAttributes>(data: T) {
        if (!data.username) {
            throw new Error('username required');
        } else if (!data.password) {
            throw new Error('Password required');
        } else {
            return;
        }
    }
}
