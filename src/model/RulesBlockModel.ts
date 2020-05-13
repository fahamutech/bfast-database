export interface RulesBlockModel {
    applicationId?: string;
    masterKey?: string;
    token?: string;
    context?: ContextBlock;
    Transaction?: TransactionBlock;
    Authentication?: {
        signUp?: {
            username: string,
            password: string,
            email?: string
        },
        signIn?: {
            username: string,
            password: string,
        },
        resetPassword?: string
    };
    Authorization?: {
        rules?: { [key: string]: string }
    },
    errors?: { [key: string]: any }[]
}


export interface ContextBlock {
    return?: string[]; // field to return to user
    uid?: string,
    auth?: boolean,
    applicationId?: string,
    masterKey?: string
}

export interface TransactionBlock {
    before?: { [key: string]: any };
    after?: { [key: string]: any };
    commit?: { [key: string]: any };
}
