import {BasicAttributesModel} from "../model/BasicAttributesModel";
import {ContextBlock} from "../model/RulesBlockModel";
import {QueryModel} from "../model/QueryModel";
import {UpdateModel} from "../model/UpdateModel";
import {DeleteModel} from "../model/DeleteModel";

export interface DatabaseAdapter {
    init(): Promise<any>;

    writeOne<T extends BasicAttributesModel, V>(domain: string, data: T, context: ContextBlock, options?: WriteOptions): Promise<V>;

    writeMany<T extends BasicAttributesModel, V>(domain: string, data: T[], context: ContextBlock, options?: WriteOptions): Promise<V>;

    updateOne<T extends BasicAttributesModel, V>(domain: string, updateModel: UpdateModel<T>, context: ContextBlock, options?: UpdateOptions): Promise<V>;

    deleteOne<T extends BasicAttributesModel, V>(domain: string, deleteModel: DeleteModel<T>, context: ContextBlock, options?: DatabaseBasicOptions): Promise<V>;

    updateMany<T extends BasicAttributesModel, V>(domain: string, updateModel: UpdateModel<T>, context: ContextBlock, options?: UpdateOptions): Promise<V>;

    query<T extends BasicAttributesModel>(domain: string, queryModel: QueryModel<T>, context: ContextBlock, options?: WriteOptions): Promise<any>;

    transaction<V>(operations: (session: V) => Promise<any>): Promise<any>;

    validDomain(domain: string): boolean;
}

export interface WriteOptions extends DatabaseBasicOptions {
    indexes?: {
        field?: string,
        unique?: boolean,
        collation?: { locale: string, strength: number },
        expireAfterSeconds?: number;
    }[];
}

export interface UpdateOptions extends DatabaseBasicOptions {
    indexes?: {
        field?: string;
        unique?: boolean;
        collation?: { locale: string, strength: number };
        expireAfterSeconds?: number;
    }[];
}

export interface DatabaseBasicOptions {
    bypassDomainVerification: boolean;
    transaction?: any;
}
