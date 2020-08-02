export interface RulesBlockModel {
    applicationId?: string;
    masterKey?: string;
    token?: string;
    context?: ContextBlock;
    Transaction?: TransactionBlock;
    auth?: {
        signUp?: {
            username: string,
            password: string,
            email?: string
        },
        signIn?: {
            username: string,
            password: string,
        },
        reset?: string
    };
    policy?: {
        rules?: { [key: string]: string }
    },
    errors?: {
        [key: string]: {
            message: string,
            path: string,
            data: any
        }
    }
}

export interface RuleResultModel {
    errors: {
        [key: string]: {
            message: string,
            path: string,
            data: any
        }
    };

    [key: string]: any;
}

export interface ContextBlock {
    return?: string[]; // field to return to user
    uid?: string,
    auth?: boolean,
    applicationId?: string,
    masterKey?: string,
    useMasterKey?: boolean
}

export interface TransactionBlock {
    before?: { [key: string]: any };
    after?: { [key: string]: any };
    commit?: { [key: string]: any };
}
