import { BasicAttributesModel } from "../model/BasicAttributesModel";
import { ContextBlock } from "../model/RulesBlockModel";
import { QueryModel } from "../model/QueryModel";
import { UpdateModel } from "../model/UpdateModel";
export interface DatabaseAdapter {
    init(): Promise<any>;
    writeOne<T extends BasicAttributesModel, V>(domain: string, data: T, context: ContextBlock, options?: WriteOptions): Promise<V>;
    writeMany<T extends BasicAttributesModel, V>(domain: string, data: T[], context: ContextBlock, options?: WriteOptions): Promise<V>;
    updateOne<T extends BasicAttributesModel, V>(domain: string, updateModel: UpdateModel<T>, context: ContextBlock, options?: UpdateOptions): Promise<V>;
    updateMany<T extends BasicAttributesModel, V>(domain: string, updateModel: UpdateModel<T>, context: ContextBlock, options?: UpdateOptions): Promise<V>;
    query<T extends BasicAttributesModel>(domain: string, queryModel: QueryModel<T>, context: ContextBlock, options?: WriteOptions): Promise<any>;
    validDomain(domain: string): boolean;
}
export interface WriteOptions {
    bypassDomainVerification: boolean;
    indexes?: {
        field: string;
        unique?: boolean;
        collation?: {
            locale: string;
            strength: number;
        };
        expireAfterSeconds?: number;
    }[];
}
export interface UpdateOptions {
    bypassDomainVerification: boolean;
    indexes?: {
        field: string;
        unique: boolean;
        collation: {
            locale: string;
            strength: number;
        };
    }[];
}
