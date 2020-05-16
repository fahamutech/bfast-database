import { SecurityAdapter } from "../adapter/SecurityAdapter";
import { ConfigAdapter } from "../config";
export declare class Security implements SecurityAdapter {
    private readonly config;
    constructor(config: ConfigAdapter);
    comparePassword(plainPassword: string, hashPassword: string): Promise<boolean>;
    hashPlainText(plainText: string): Promise<string>;
    revokeToken(token: string): Promise<any>;
    generateToken(data: {
        uid: string;
        [key: string]: any;
    }, expire?: string): Promise<string>;
    verifyToken<T>(token: string): Promise<T>;
    decodeToken(token: string): any;
    private static dayToSecond;
}
