import {BasicAttributesModel} from "../model/BasicAttributesModel";
import {ContextBlock} from "../model/RulesBlockModel";
import {QueryModel} from "../model/QueryModel";

export interface DatabaseAdapter {
    init(): Promise<any>;

    writeOne<T extends BasicAttributesModel, V>(domain: string, data: T, context: ContextBlock, options?: WriteOptions): Promise<V>;

    writeMany<T extends BasicAttributesModel, V>(domain: string, data: T[], context: ContextBlock, options?: WriteOptions): Promise<V>;

    query<T extends BasicAttributesModel>(domain: string, queryModel: QueryModel<T>, context: ContextBlock, options?: WriteOptions): Promise<any>;

    // this must be moved to controller
    // sanitize4Db<T extends BasicAttributesModel>(data: T): T;
    //
    // sanitize4User<T extends BasicAttributesModel>(data: T, returns: string[]): T;
    //
    // addCreateMetadata<T extends BasicAttributesModel>(data: T, context?: ContextBlock): T;
    //
    // addUpdateMetadata<T extends BasicAttributesModel>(data: T, context?: ContextBlock): T;

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
