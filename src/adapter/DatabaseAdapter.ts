import {BasicAttributesModel} from "../model/BasicAttributesModel";
import {ContextBlock} from "../model/RulesBlockModel";

export interface DatabaseAdapter {
    init(): Promise<any>;

    writeOne<T extends BasicAttributesModel, V>(domain: string, data: T, context: ContextBlock): Promise<V>;

    writeMany<T extends BasicAttributesModel, V>(domain: string, data: T[], context: ContextBlock): Promise<V>;

    sanitize4Db<T extends BasicAttributesModel>(data: T): T;

    sanitize4User<T extends BasicAttributesModel>(data: T, returns: string[]): T;

    addCreateMetadata<T extends BasicAttributesModel>(data: T, context: ContextBlock): T;

    addUpdateMetadata<T extends BasicAttributesModel>(data: T, context: ContextBlock): T;
}
