import {DatabaseAdapter} from "../adapter/DatabaseAdapter";
import {MongoClient} from "mongodb";
import {ConfigAdapter, DaaSConfig} from "../config";
import {BasicAttributesModel} from "../model/BasicAttributesModel";
import {ContextBlock} from "../model/RulesBlockModel";

export class Database implements DatabaseAdapter {
    private _mongoClient: MongoClient;

    constructor(private readonly config: ConfigAdapter) {
    }

    sanitize4Db<T extends BasicAttributesModel>(data: T): T {
        if (data.return) {
            delete data.return;
        }
        if (data && data.id) {
            data._id = data.id;
            delete data.id;
        }
        if (data && data.createdAt) {
            data._created_at = data.createdAt;
            delete data.createdAt;
        }
        if (data && data.updatedAt) {
            data._updated_at = data.updatedAt;
            delete data.updatedAt;
        }
        if (data && data.createdBy) {
            data._created_by = data.createdBy;
            delete data.createdBy;
        }
        return data;
    }

    sanitize4User<T extends BasicAttributesModel>(data: T, returnFields: string[]): T {
        if (data && data._id !== undefined) {
            data.id = data._id.toString();
            delete data._id;
        }
        if (data && data._created_at !== undefined) {
            data.createdAt = data._created_at;
            delete data._created_at;
        }
        if (data && data._updated_at !== undefined) {
            data.updatedAt = data._updated_at;
            delete data._updated_at;
        }
        if (data && data._created_by !== undefined) {
            data.createdBy = data._created_by;
            delete data._created_by;
        }
        let returnedData: any = {};
        if (!returnFields) {
            returnedData.id = data.id;
            return returnedData;
        } else if (returnFields && Array.isArray(returnFields) && returnFields.length === 0) {
            return data;
        } else {
            returnFields.forEach(value => {
                returnedData[value] = data[value]
            });
            returnedData.id = data.id;
            return returnedData;
        }
    }

    async writeMany<T extends BasicAttributesModel, V>(domain: string, data: T[], context: ContextBlock): Promise<V> {
        if (!this.validDomain(domain)){
            throw {
                message:`${domain} is not a valid domain name`
            }
        }
        let returnFieldsMap = {};
        data.forEach((value, index) => {
            returnFieldsMap[index] = value.return;
        });
        const conn = await this.connection();
        const sanitizedData = data.map(value => this.sanitize4Db(value));
        const freshData = sanitizedData.map(value => this.addCreateMetadata(value, context));
        const response = await conn.db().collection(domain).insertMany(freshData);
        Object.keys(response.insertedIds).forEach(index => {
            freshData[index]._id = response.insertedIds[index];
            freshData[index] = this.sanitize4User(freshData[index], returnFieldsMap[index])
        });
        return freshData as any;
    }

    async writeOne<T extends BasicAttributesModel, V>(domain: string, data: T, context: ContextBlock): Promise<V> {
        if (!this.validDomain(domain)){
            throw {
                message:`${domain} is not a valid domain name`
            }
        }
        const returnFields = data.return;
        const conn = await this.connection();
        const sanitizedData = this.sanitize4Db(data);
        const freshData = this.addCreateMetadata(sanitizedData, context);
        const response = await conn.db().collection(domain).insertOne(freshData);
        freshData._id = response.insertedId;
        return this.sanitize4User(freshData, returnFields) as any;
    }

    private async connection(): Promise<MongoClient> {
        if (this._mongoClient && this._mongoClient.isConnected()) {
            return this._mongoClient;
        } else {
            const mongoUri = DaaSConfig.getInstance().mongoDbUri;
            return new MongoClient(mongoUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }).connect();
        }
    }

    init(): Promise<any> {
        return Promise.resolve(undefined);
    }

    addCreateMetadata<T extends BasicAttributesModel>(data: T, context: ContextBlock): T {
        data._created_by = context.uid;
        data._created_at = new Date();
        data._updated_at = new Date();
        return data;
    }

    addUpdateMetadata<T extends BasicAttributesModel>(data: T, context: ContextBlock): T {
        data._updated_at = new Date();
        return data;
    }

    validDomain(domain: string): boolean {
        return (domain !== '_User' && domain !== '_Token');
    }
}
