import { DatabaseAdapter, UpdateOptions, WriteOptions } from "../adapter/DatabaseAdapter";
import { ConfigAdapter } from "../config";
import { BasicAttributesModel } from "../model/BasicAttributesModel";
import { ContextBlock } from "../model/RulesBlockModel";
import { QueryModel } from "../model/QueryModel";
import { UpdateModel } from "../model/UpdateModel";
export declare class Database implements DatabaseAdapter {
    private readonly config;
    private _mongoClient;
    constructor(config: ConfigAdapter);
    sanitize4Db<T extends BasicAttributesModel>(data: T): T;
    sanitizeQueryData4Db<T extends BasicAttributesModel>(data: T): void;
    sanitize4User<T extends BasicAttributesModel>(data: T, returnFields: string[]): T;
    writeMany<T extends BasicAttributesModel, V>(domain: string, data: T[], context: ContextBlock, options?: WriteOptions): Promise<V>;
    writeOne<T extends BasicAttributesModel, V>(domain: string, data: T, context: ContextBlock, options?: WriteOptions): Promise<V>;
    private connection;
    init(): Promise<any>;
    addCreateMetadata<T extends BasicAttributesModel>(data: T, context?: ContextBlock): T;
    addUpdateMetadata<T extends BasicAttributesModel>(data: T, context?: ContextBlock): T;
    validDomain(domain: string): boolean;
    private handleDomainValidation;
    private handleIndexesCreation;
    query<T extends BasicAttributesModel>(domain: string, queryModel: QueryModel<T>, context: ContextBlock, options?: WriteOptions): Promise<any>;
    updateOne<T extends BasicAttributesModel, V>(domain: string, updateModel: UpdateModel<T>, context: ContextBlock, options?: UpdateOptions): Promise<V>;
    updateMany<T extends BasicAttributesModel, V>(domain: string, updateModel: UpdateModel<T>, context: ContextBlock, options?: UpdateOptions): Promise<V>;
}
