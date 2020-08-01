import {AuthAdapter} from "../adapter/AuthAdapter";
import {BasicUserAttributes} from "../model/BasicUserAttributes";
import {ContextBlock} from "../model/RulesBlockModel";
import {DatabaseController} from "../controllers/DatabaseController";
import {SecurityController} from "../controllers/SecurityController";
import {EmailController} from "../controllers/EmailController";

export class Auth implements AuthAdapter {
    private domainName = '_User';

    constructor(private readonly _database: DatabaseController,
                private readonly _security: SecurityController,
                private readonly _email: EmailController) {
    }

    async resetPassword(email: string, context?: ContextBlock): Promise<any> {
        if (!email) {
            throw new Error('Email required');
        }
        throw new Error('Not implemented');
    }

    async signIn<T extends BasicUserAttributes>(userModel: T, context: ContextBlock): Promise<T> {
        const users = await this._database.query(this.domainName, {
            filter: {
                username: userModel.username
            },
            return: []
        }, context, {
            bypassDomainVerification: true
        });
        if (users && Array.isArray(users) && users.length == 1) {
            const user = users[0];
            if (await this._security.comparePassword(userModel.password, user.password ? user.password : user._hashed_password)) {
                delete user.password;
                delete user._hashed_password;
                delete user._acl;
                delete user._rperm;
                delete user._wperm;
                user.token = await this._security.generateToken({uid: user.id});
                return user;
            } else {
                throw new Error("Username/Password is not valid");
            }
        } else {
            throw new Error("Username/Password is not valid");
        }
    }

    async signUp<T extends BasicUserAttributes>(userModel: T, context: ContextBlock): Promise<T> {
        userModel.password = await this._security.hashPlainText(userModel?.password);
        const user = await this._database.writeOne(this.domainName, userModel, context, {
            bypassDomainVerification: true
        });
        delete user.password;
        user.token = await this._security.generateToken({uid: user.id});
        return user;
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
