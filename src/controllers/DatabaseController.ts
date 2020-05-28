import {BasicAttributesModel} from "../model/BasicAttributesModel";
import {ContextBlock} from "../model/RulesBlockModel";
import {DatabaseAdapter, DatabaseBasicOptions, UpdateOptions, WriteOptions} from "../adapter/DatabaseAdapter";
import {UpdateModel} from "../model/UpdateModel";
import {DeleteModel} from "../model/DeleteModel";
import {QueryModel} from "../model/QueryModel";
import {SecurityController} from "./SecurityController";

let _database: DatabaseAdapter;
let _security: SecurityController;

export class DatabaseController {

    constructor(private readonly database: DatabaseAdapter,
                private readonly security: SecurityController) {
        _database = this.database;
        _security = this.security;
    }

    private async handleDomainValidation(domain: string) {
        if (!this.validDomain(domain)) {
            throw {
                message: `${domain} is not a valid domain name`
            }
        }
    }

    init(): Promise<any> {
        try {
            return _database.init();
        } catch (e) {
            console.warn(e);
            return;
        }
    }

    async writeOne<T extends BasicAttributesModel, V>(domain: string, data: T, context: ContextBlock, options?: WriteOptions): Promise<V> {
        if (!options?.bypassDomainVerification) {
            await this.handleDomainValidation(domain);
        }
        const returnFields = data.return;
        const sanitizedData = this.sanitize4Db(data);
        const freshData = this.addCreateMetadata(sanitizedData, context);
        freshData._id = await _database.writeOne<any>(domain, data, context, options);
        return this.sanitize4User(freshData, returnFields) as any;
    }

    async update(domain: string, updateModel: UpdateModel<any>,
                 context: ContextBlock, options?: UpdateOptions): Promise<any> {
        if (!options?.bypassDomainVerification) {
            await this.handleDomainValidation(domain);
        }
        const returnFields = updateModel.return;
        updateModel.update = this.sanitize4Db(updateModel.update);
        updateModel.filter = this.sanitize4Db(updateModel.filter);
        updateModel.update = this.addUpdateMetadata(updateModel.update, context);
        const updatedDoc = await _database.update<any, any>(domain, updateModel, context, options)
        return this.sanitize4User(updatedDoc, returnFields);
    }

    async delete(domain: string, deleteModel: DeleteModel<any>,
                 context: ContextBlock, options?: DatabaseBasicOptions): Promise<any> {
        if (!options?.bypassDomainVerification) {
            await this.handleDomainValidation(domain);
        }
        // const returnFields = deleteModel.return;
        deleteModel.filter = this.sanitize4Db(deleteModel.filter);
        const result = await _database.deleteOne<any, any>(domain, deleteModel, context, options);
        return this.sanitize4User(result, ["id"]);
    }

    async transaction<V>(operations: (session: any) => Promise<any>): Promise<any> {
        return _database.transaction(operations);
    }

    async aggregate(domain: string, pipelines: Object[], context: ContextBlock, options?: WriteOptions): Promise<any> {
        if (!options?.bypassDomainVerification) {
            await this.handleDomainValidation(domain);
        }
        return _database.aggregate(domain, pipelines, context, options);
    }

    async changes(domain: string, pipeline: any[], listener: (doc: any) => void): Promise<any> {
        await this.handleDomainValidation(domain);
        return _database.changes(domain, pipeline, listener);
    }

    async query(domain: string, queryModel: QueryModel<any>, context: ContextBlock, options?: WriteOptions): Promise<any> {
        const returnFields = queryModel.return;
        if (!options?.bypassDomainVerification) {
            await this.handleDomainValidation(domain);
        }
        if (queryModel.id) {
            queryModel = this.sanitize4Db(queryModel);
            queryModel.filter = this.sanitize4Db(queryModel.filter);

            const result = await _database.findOne(domain, queryModel, context, options);
            return this.sanitize4User(result, returnFields);
        } else {
            queryModel = this.sanitize4Db(queryModel);
            queryModel.filter = this.sanitize4Db(queryModel.filter);
            const result = await _database.findMany(domain, queryModel, context, options);
            if (result && Array.isArray(result)){
                return result.map(value => this.sanitize4User(value, returnFields));
            }
            return result;
        }
    }

    async writeMany<T extends BasicAttributesModel, V>(domain: string, data: T[], context: ContextBlock, options?: WriteOptions): Promise<V> {
        if (!options?.bypassDomainVerification) {
            await this.handleDomainValidation(domain);
        }
        let returnFieldsMap = {};
        data.forEach((value, index) => {
            returnFieldsMap[index] = value.return;
        });
        const sanitizedData = data.map(value => this.sanitize4Db(value));
        const freshData = sanitizedData.map(value => this.addCreateMetadata(value, context));
        const insertedIds = await _database.writeMany<any, object>(domain, freshData, context, options);
        Object.keys(insertedIds).forEach(index => {
            freshData[index]._id = insertedIds[index];
            freshData[index] = this.sanitize4User(freshData[index], returnFieldsMap[index]);
        });
        return freshData as any;
    }

    addUpdateMetadata<T extends BasicAttributesModel>(data: T, context?: ContextBlock): T {
        data['$currentDate'] = {_updated_at: true}
        return data;
    }

    validDomain(domain: string): boolean {
        return (domain !== '_User' && domain !== '_Token' && domain !== '_Policy');
    }

    addCreateMetadata<T extends BasicAttributesModel>(data: T, context?: ContextBlock): T {
        data._created_by = context?.uid;
        data._created_at = new Date();
        data._updated_at = new Date();
        if (data.id) {
            data._id = data.id
        } else if (data._id) {
        } else {
            data._id = _security.generateUUID();
        }
        return data;
    }

    sanitize4Db<T extends BasicAttributesModel>(data: T): T {
        if (!data) {
            return null;
        }
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
        if (!data) {
            return null;
        }
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
        if (data && data._hashed_password) {
            delete data._hashed_password;
        }
        if (data && data._rperm) {
            delete data._rperm;
        }
        if (data && data._wperm) {
            delete data._wperm;
        }
        if (data && data._acl) {
            delete data._acl;
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

}
