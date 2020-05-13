import {BasicAttributesModel} from "../model/BasicAttributesModel";
import {ContextBlock} from "../model/RulesBlockModel";
import {FilterModel} from "../model/FilterModel";

export interface DatabaseAdapter {
    init(): Promise<any>;

    writeOne<T extends BasicAttributesModel, V>(domain: string, data: T, context: ContextBlock, options?: WriteOptions): Promise<V>;

    writeMany<T extends BasicAttributesModel, V>(domain: string, data: T[], context: ContextBlock, options?: WriteOptions): Promise<V>;

    query(domain: string, filter: FilterModel, context: ContextBlock, options?: WriteOptions): Promise<any>;

    sanitize4Db<T extends BasicAttributesModel>(data: T): T;

    sanitize4User<T extends BasicAttributesModel>(data: T, returns: string[]): T;

    addCreateMetadata<T extends BasicAttributesModel>(data: T, context?: ContextBlock): T;

    addUpdateMetadata<T extends BasicAttributesModel>(data: T, context?: ContextBlock): T;

    validDomain(domain: string): boolean;
}

export interface WriteOptions {
    bypassDomainVerification: boolean,
    indexes?: {
        field: string,
        unique: boolean,
        collation: { locale: string, strength: number }
    }[]
}
