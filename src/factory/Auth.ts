import {AuthAdapter} from "../adapter/AuthAdapter";
import {ConfigAdapter} from "../utils/config";
import {BasicUserAttributes} from "../model/BasicUserAttributes";
import {DatabaseAdapter} from "../adapter/DatabaseAdapter";
import {Database} from "./Database";
import {ContextBlock} from "../model/RulesBlockModel";
import {SecurityAdapter} from "../adapter/SecurityAdapter";
import {Security} from "./Security";
import {EmailAdapter} from "../adapter/EmailAdapter";
import {Email} from "./Email";

let database: DatabaseAdapter;
let security: SecurityAdapter;
let emailAdapter: EmailAdapter;

export class Auth implements AuthAdapter {
    private domainName = '_User';
    private policyDomainName = '_Policy';

    constructor(private readonly config: ConfigAdapter) {
        database = (config.adapters && config.adapters.database) ?
            config.adapters.database(config) : new Database(config);
        security = (config.adapters && config.adapters.security) ?
            config.adapters.security(config) : new Security(config);
        emailAdapter = (config.adapters && config.adapters.email) ?
            config.adapters.email(config) : new Email(config);
    }

    async resetPassword(email: string, context?: ContextBlock): Promise<any> {
        if (!email) {
            throw new Error('Email required');
        }
        throw new Error('Not implemented');
    }

    async signIn<T extends BasicUserAttributes>(userModel: T, context?: ContextBlock): Promise<T> {
        Auth.validateData(userModel, true);
        userModel.return = [];
        const users = await database.query<any>(this.domainName, {
            filter: {
                username: userModel.username
            },
            return: []
        }, context, {
            bypassDomainVerification: true
        });
        if (users && Array.isArray(users) && users.length == 1) {
            const user = users[0];
            if (await security.comparePassword(userModel.password, user.password)) {
                delete user.password;
                user.token = security.generateToken({uid: user.id});
                return user;
            } else {
                throw new Error("Username/Password is not valid");
            }
        } else {
            throw new Error("Username/Password is not valid");
        }
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
        user.token = await security.generateToken({uid: user.id});
        return user;
    }

    async addAuthorizationRule(ruleId: string, rule: string, context: ContextBlock): Promise<any> {
        return database.updateOne(this.policyDomainName, {
            filter: {
                ruleId: ruleId
            },
            upsert: true,
            return: [],
            update: {
                // @ts-ignore
                $set: {
                    ruleId: ruleId,
                    ruleBody: rule,
                }
            }
        }, context, {
            bypassDomainVerification: context && context.useMasterKey === true
        });
    }

    async hasPermission(ruleId: string, context: ContextBlock): Promise<boolean> {
        if (context && context.useMasterKey === true) {
            return true;
        }
        const filter = {
            $or: []
        };
        const originalRule = ruleId;
        let globalRule;
        const ruleIdInArray = ruleId.split('.');
        if (ruleIdInArray.length >= 2) {
            ruleIdInArray[1] = '*';
            globalRule = ruleIdInArray.join('.');
            filter.$or.push({ruleId: globalRule});
        }
        filter.$or.push({ruleId: originalRule});
        const query: any[] = await database.query(this.policyDomainName, {
            return: [],
            filter: filter,
        }, context, {
            bypassDomainVerification: true
        });
        if (query.length === 0) {
            return false;
        }
        const originalRuleResult = query.filter(value => value.ruleId === originalRule);
        if (originalRuleResult && originalRuleResult.length === 1 && originalRuleResult[0].ruleBody) {
            const execRule = new Function('context', originalRuleResult[0].ruleBody);
            return execRule(context) === true;
        }
        const globalRuleResult = query.filter(value => value.ruleId === globalRule);
        if (globalRuleResult && globalRuleResult.length === 1 && globalRuleResult[0].ruleBody) {
            const execRule = new Function('context', globalRuleResult[0].ruleBody);
            return execRule(context) === true;
        }
        return false;
    }

    private static validateData<T extends BasicUserAttributes>(data: T, skipEmail = false) {
        if (!data.username) {
            throw new Error('username required');
        } else if (!data.password) {
            throw new Error('Password required');
        } else if (!data.email && !skipEmail) {
            throw new Error('Email required');
        } else {
            return;
        }
    }

    async deleteUser(context?: ContextBlock): Promise<any> {
        return Promise.resolve(undefined);
    }

    async sendVerificationEmail(email: string, context?: ContextBlock): Promise<any> {
        return Promise.resolve(undefined);
    }

    async update<T extends BasicUserAttributes>(userModel: T, context?: ContextBlock): Promise<T> {
        return Promise.resolve(undefined);
    }

    async updatePassword(password: string, context?: ContextBlock): Promise<any> {
        return Promise.resolve(undefined);
    }
}
