import {BasicUserAttributes} from "../model/BasicUserAttributes";

export interface AuthAdapter {
    signUp<T extends BasicUserAttributes>(userModel: T): Promise<T>;

    signIn<T extends BasicUserAttributes>(userModel: T): Promise<T>;

    resetPassword(email: string): Promise<any>;
}
