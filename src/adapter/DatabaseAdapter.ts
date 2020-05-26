import {BasicAttributesModel} from "../model/BasicAttributesModel";
import {ContextBlock} from "../model/RulesBlockModel";
import {QueryModel} from "../model/QueryModel";
import {UpdateModel} from "../model/UpdateModel";
import {DeleteModel} from "../model/DeleteModel";

export interface DatabaseAdapter {

    /**
     * initialize some database pre operation like indexes
     */
    init(): Promise<any>;

    /**
     * return promise which resolve to string which is id of a created document
     * @param domain
     * @param data
     * @param context
     * @param options
     */
    writeOne<T extends BasicAttributesModel>(domain: string, data: T, context: ContextBlock, options?: WriteOptions): Promise<string>;

    /**
     * return promise which resolve to object of ids of a created documents
     * @param domain
     * @param data
     * @param context
     * @param options
     */
    writeMany<T extends BasicAttributesModel, V>(domain: string, data: T[], context: ContextBlock, options?: WriteOptions): Promise<V>;

    update<T extends BasicAttributesModel, V>(domain: string, updateModel: UpdateModel<T>, context: ContextBlock, options?: UpdateOptions): Promise<V>;

    deleteOne<T extends BasicAttributesModel, V>(domain: string, deleteModel: DeleteModel<T>, context: ContextBlock, options?: DatabaseBasicOptions): Promise<V>;

    findOne<T extends BasicAttributesModel>(domain: string, queryModel: QueryModel<T>, context: ContextBlock, options?: WriteOptions): Promise<any>;

    findMany<T extends BasicAttributesModel>(domain: string, queryModel: QueryModel<T>, context: ContextBlock, options?: WriteOptions): Promise<any>;

    changes(domain: string, pipeline: any[], listener: (doc: any) => void): Promise<any>;

    transaction<V>(operations: (session: V) => Promise<any>): Promise<any>;

    createIndexes(domain: string, indexes: any[]): Promise<any>;

    dropIndexes(domain: string): Promise<any>;

    aggregate(domain: string, pipelines: Object[], context: ContextBlock, options?: WriteOptions): Promise<any>;
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
