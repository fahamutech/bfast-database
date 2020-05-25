export interface SecurityAdapter {
    generateToken<T extends { uid: string, [key: string]: any }>(data: T, expire?: string): Promise<string>;

    verifyToken<T>(token: string): Promise<T>;

    decodeToken<T>(token: string): T;

    revokeToken(token: string): Promise<any>;

    hashPlainText(plainText: string): Promise<string>;

    generateUUID(): string;

    comparePassword(plainPassword: string, hashPassword: string): Promise<boolean>;
}
