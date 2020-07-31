import {BasicAttributesModel} from "../model/BasicAttributesModel";
import {ContextBlock} from "../model/RulesBlockModel";
import {
    DatabaseAdapter,
    DatabaseBasicOptions,
    DatabaseUpdateOptions,
    DatabaseWriteOptions
} from "../adapter/DatabaseAdapter";
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

    /**
     * check if given domain/collection/table name is valid name
     * @param domain {string}
     * @return Promise
     */
    async handleDomainValidation(domain: string): Promise<any> {
        if (!this.validDomain(domain)) {
            throw {
                message: `${domain} is not a valid domain name`
            }
        }
        return true;
    }

    /**
     * initiate all necessary initialization of a database like indexes etc
     * @param mandatory {boolean} pass true if you want controller to throw
     * error when database initialization fails, default is false
     * @return Promise
     */
    async init(mandatory = false): Promise<any> {
        try {
            return _database.init();
        } catch (e) {
            if (mandatory === true) {
                throw e;
            }
            console.warn(e);
            return;
        }
    }

    /**
     * perform a single write operation in a database
     * @param domain {string} domain/collection/table to write data to
     * @param data {Object}  a map of which represent a data to be written
     * @param context {ContextBlock} current operation context
     * @param options {DatabaseWriteOptions} database write operation options
     */
    async writeOne<T extends BasicAttributesModel>(domain: string, data: T, context: ContextBlock,
                                                      options: DatabaseWriteOptions = {bypassDomainVerification: false}): Promise<T> {
        if (options && options.bypassDomainVerification === false) {
            await this.handleDomainValidation(domain);
        }
        const returnFields = this.getReturnFields<T>(data);
        const sanitizedData = this.sanitize4Db(data);
        const sanitizedDataWithCreateMetadata = this.addCreateMetadata(sanitizedData, context);
        sanitizedDataWithCreateMetadata._id = await _database.writeOne<T>(domain, data, context, options);
        return this.sanitize4User<T>(sanitizedDataWithCreateMetadata, returnFields) as T;
    }

    /**
     *
     * @param domain
     * @param updateModel
     * @param context
     * @param options
     */
    async update(domain: string, updateModel: UpdateModel<any>,
                 context: ContextBlock, options?: DatabaseUpdateOptions): Promise<any> {
        if (!options?.bypassDomainVerification) {
            await this.handleDomainValidation(domain);
        }
        const returnFields = updateModel.return;
        updateModel.update = this.sanitize4Db(updateModel.update as any);
        updateModel.filter = this.sanitize4Db(updateModel.filter as any);
        updateModel.update = this.addUpdateMetadata(updateModel.update as any, context);
        const updatedDoc = await _database.update<any, any>(domain, updateModel, context, options)
        return this.sanitize4User(updatedDoc, returnFields);
    }

    async delete(domain: string, deleteModel: DeleteModel<any>,
                 context: ContextBlock, options?: DatabaseBasicOptions): Promise<any> {
        if (!options?.bypassDomainVerification) {
            await this.handleDomainValidation(domain);
        }
        // const returnFields = deleteModel.return;
        deleteModel.filter = this.sanitize4Db(deleteModel.filter as any);
        const result = await _database.deleteOne<any, any>(domain, deleteModel, context, options);
        return this.sanitize4User(result, ["id"]);
    }

    async transaction<V>(operations: (session: any) => Promise<any>): Promise<any> {
        return _database.transaction(operations);
    }

    async aggregate(domain: string, pipelines: Object[], context: ContextBlock, options?: DatabaseWriteOptions): Promise<any> {
        if (!options?.bypassDomainVerification) {
            await this.handleDomainValidation(domain);
        }
        return _database.aggregate(domain, pipelines, context, options);
    }

    async changes(domain: string, pipeline: any[], listener: (doc: any) => void): Promise<any> {
        await this.handleDomainValidation(domain);
        return _database.changes(domain, pipeline, listener);
    }

    async query(domain: string, queryModel: QueryModel<any>, context: ContextBlock, options?: DatabaseWriteOptions): Promise<any> {
        const returnFields = queryModel.return;
        if (!options?.bypassDomainVerification) {
            await this.handleDomainValidation(domain);
        }
        if (queryModel.id) {
            queryModel = this.sanitize4Db(queryModel as any);
            queryModel.filter = this.sanitize4Db(queryModel.filter as any);

            const result = await _database.findOne(domain, queryModel, context, options);
            return this.sanitize4User(result, returnFields);
        } else {
            queryModel = this.sanitize4Db(queryModel as any);
            queryModel.filter = this.sanitize4Db(queryModel.filter as any);
            const result = await _database.query(domain, queryModel, context, options);
            if (result && Array.isArray(result)) {
                return result.map(value => this.sanitize4User(value, returnFields));
            }
            return result;
        }
    }

    async writeMany<T extends BasicAttributesModel, V>(domain: string, data: T[], context: ContextBlock, options?: DatabaseWriteOptions): Promise<V> {
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

    /**
     * add update metadata to a model before update operation in bfast::database
     * @param data
     * @param context
     */
    addUpdateMetadata<T extends BasicAttributesModel>(data: T, context?: ContextBlock): T {
        data['$currentDate'] = {_updated_at: true}
        return data;
    }

    /**
     * check if supplied custom domain/table/collection name is valid.
     * _User, _Token and _Policy is the domain name that keep for internal use only
     * @param domain
     */
    validDomain(domain: string): boolean {
        return (domain !== '_User' && domain !== '_Token' && domain !== '_Policy');
    }

    /**
     * prepare data to be written to bfast::database by adding
     * create metadata
     * @param data
     * @param context
     */
    addCreateMetadata<T extends BasicAttributesModel>(data: T, context?: ContextBlock): T {
        data._created_by = context?.uid;
        data._created_at = new Date();
        data._updated_at = new Date();
        if (data && data.id && typeof data.id !== "boolean") {
            data._id = data.id
        } else {
            data._id = _security.generateUUID();
        }
        return data;
    }

    /**
     * get a return fields from a return attribute of the data
     * @param data
     */
    getReturnFields<T extends BasicAttributesModel>(data: T) {
        if (data && data.return && Array.isArray(data.return)) {
            let flag = true;
            if (data.return.length > 0) {
                data.return.forEach(value => {
                    if (typeof value !== "string") {
                        flag = false;
                    }
                });
            }
            if (flag === true) {
                return data.return;
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }
    }

    /**
     * sanitize data before consumed by a bfast::database
     * @param data
     */
    sanitize4Db<T extends BasicAttributesModel>(data: T): T {
        if (!data && typeof data !== "boolean") {
            return null;
        }
        if (data.return && typeof data.return !== "boolean") {
            delete data.return;
        }
        if (data && data.id && typeof data.id !== "boolean") {
            data._id = data.id;
            delete data.id;
        }

        if (data && data.createdAt && typeof data.createdAt !== "boolean") {
            data._created_at = data.createdAt;
            delete data.createdAt;
        }

        if (data && data.updatedAt && typeof data.updatedAt !== "boolean") {
            data._updated_at = data.updatedAt;
            delete data.updatedAt;
        }

        if (data && data.createdBy && typeof data.createdAt !== "boolean") {
            data._created_by = data.createdBy;
            delete data.createdBy;
        }
        return data;
    }

    /**
     * sanitize data to return to a request
     * @param data
     * @param returnFields
     */
    sanitize4User<T extends BasicAttributesModel>(data: T, returnFields: string[]): T {
        if (!data && typeof data !== "boolean") {
            return null;
        }
        if (data && data._id && typeof data._id !== "boolean") {
            data.id = data._id.toString();
            delete data._id;
        }
        if (data && data._created_at && typeof data._created_at !== "boolean") {
            data.createdAt = data._created_at;
            delete data._created_at;
        }
        if (data && data._updated_at && typeof data._updated_at !== "boolean") {
            data.updatedAt = data._updated_at;
            delete data._updated_at;
        }
        if (data && data._created_by && typeof data._created_by !== "boolean") {
            data.createdBy = data._created_by;
            delete data._created_by;
        }
        if (data && data._hashed_password && typeof data._hashed_password !== "boolean") {
            delete data._hashed_password;
        }
        if (data && data._rperm && typeof data._rperm !== "boolean") {
            delete data._rperm;
        }
        if (data && data._wperm && typeof data._wperm !== "boolean") {
            delete data._wperm;
        }
        if (data && data._acl && typeof data._acl !== "boolean") {
            delete data._acl;
        }
        let returnedData: any = {};
        if (!returnFields && typeof returnFields !== "boolean") {
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
