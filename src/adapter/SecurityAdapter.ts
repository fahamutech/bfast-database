export interface SecurityAdapter {
    generateToken<T>(data: T, expire?: string): Promise<string>;

    verifyToken<T>(token: string): Promise<T>;

    decodeToken<T>(token: string): T;

    revokeToken(token: string): Promise<any>;

    encryptPassword(plainText: string): Promise<string>;

    comparePassword(plainPassword: string, hashPassword: string): Promise<boolean>;
}
