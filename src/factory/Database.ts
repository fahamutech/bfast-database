import {
    DatabaseAdapter,
    DatabaseBasicOptions,
    DatabaseUpdateOptions,
    DatabaseWriteOptions
} from "../adapter/DatabaseAdapter";
import {MongoClient} from "mongodb";
import {BasicAttributesModel} from "../model/BasicAttributesModel";
import {ContextBlock} from "../model/RulesBlockModel";
import {QueryModel} from "../model/QueryModel";
import {UpdateModel} from "../model/UpdateModel";
import {DeleteModel} from "../model/DeleteModel";
import {ConfigAdapter} from "../config";

export class Database implements DatabaseAdapter {
    private _mongoClient: MongoClient;

    constructor(private readonly config: ConfigAdapter) {
    }

    async writeMany<T extends BasicAttributesModel, V>(domain: string, data: T[], context: ContextBlock, options?: DatabaseWriteOptions): Promise<V> {
        const conn = await this.connection();
        const response = await conn.db().collection(domain).insertMany(data, {
            session: options && options.transaction ? options.transaction : undefined
        });
        return response.insertedIds as any;
    }

    async writeOne<T extends BasicAttributesModel>(domain: string, data: T, context: ContextBlock, options?: DatabaseWriteOptions): Promise<any> {
        const conn = await this.connection();
        const response = await conn.db().collection(domain).insertOne(data, {
            w: "majority",
            session: options && options.transaction ? options.transaction : undefined
        });
        return response.insertedId;
    }

    private async connection(): Promise<MongoClient> {
        if (this._mongoClient && this._mongoClient.isConnected()) {
            return this._mongoClient;
        } else {
            const mongoUri = this.config.mongoDbUri;
            return new MongoClient(mongoUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }).connect();
        }
    }

    async init(): Promise<any> {
        try {
            await this.dropIndexes('_User');
        } catch (e) {
            // console.warn(e);
        }
        await this.createIndexes('_User', [
            {
                field: 'email',
                unique: true,
                collation: {
                    locale: 'en',
                    strength: 2
                }
            },
            {
                field: 'username',
                unique: true,
                collation: {
                    locale: 'en',
                    strength: 2
                }
            }
        ]);
        return Promise.resolve();
    }

    async createIndexes(domain: string, indexes: any[]) {
        if (indexes && Array.isArray(indexes)) {
            const conn = await this.connection();
            for (const value of indexes) {
                const indexOptions: any = {};
                Object.assign(indexOptions, value);
                delete indexOptions.field;
                await conn.db().collection(domain).createIndex({[value.field]: 1}, indexOptions);
            }
            return;
        } else {
            return;
        }
    }

    async dropIndexes(domain: string) {
        const conn = await this.connection();
        await conn.db().collection(domain).dropIndexes();
        return;
    }

    async findOne<T extends BasicAttributesModel>(domain: string, queryModel: QueryModel<T>,
                                                  context: ContextBlock, options?: DatabaseWriteOptions): Promise<any> {
        const conn = await this.connection();
        return await conn.db().collection(domain).findOne<T>({_id: queryModel._id}, {
            session: options && options.transaction ? options.transaction : undefined
        });
    }

    async query<T extends BasicAttributesModel>(domain: string, queryModel: QueryModel<T>,
                                                context: ContextBlock, options?: DatabaseWriteOptions): Promise<any> {
        const conn = await this.connection();
        const query = conn.db().collection(domain).find(queryModel.filter, {
            session: options && options.transaction ? options.transaction : undefined
        });
        if (queryModel.skip) {
            query.skip(queryModel.skip);
        } else {
            query.skip(0)
        }
        if (queryModel.size) {
            if (queryModel.size !== -1) {
                query.limit(queryModel.size);
            }
        } else {
            if (queryModel.count === false) {
                query.limit(20);
            }
        }
        if (queryModel.orderBy && Array.isArray(queryModel.orderBy) && queryModel.orderBy.length > 0) {
            queryModel.orderBy.forEach(value => {
                query.sort(value);
            });
        }
        if (queryModel.count === true) {
            return await query.count();
        }
        return await query.toArray();
    }

    async update<T extends BasicAttributesModel, V>(domain: string, updateModel: UpdateModel<T>,
                                                    context: ContextBlock, options?: DatabaseUpdateOptions): Promise<V> {
        const conn = await this.connection();
        const response = await conn.db().collection(domain).findOneAndUpdate(updateModel.filter, updateModel.update, {
            upsert: false,// updateModel.upsert === true,
            returnOriginal: false,
            session: options && options.transaction ? options.transaction : undefined
        });
        return response.value;
    }

    async deleteOne<T extends BasicAttributesModel, V>(domain: string, deleteModel: DeleteModel<T>,
                                                       context: ContextBlock, options?: DatabaseBasicOptions): Promise<V> {
        const conn = await this.connection();
        const response = await conn.db()
            .collection(domain)
            .findOneAndDelete(deleteModel.filter, {
                session: options && options.transaction ? options.transaction : undefined
            });
        return response.value as any;
    }

    async transaction<V>(operations: (session: any) => Promise<any>): Promise<any> {
        const conn = await this.connection();
        const session = conn.startSession();
        try {
            await session.withTransaction(async _ => {
                return await operations(session);
            }, {
                readPreference: "primary",
                readConcern: {
                    level: "local"
                },
                writeConcern: {
                    w: "majority"
                }
            });
        } finally {
            await session.endSession();
        }
    }

    async aggregate(domain: string, pipelines: Object[], context: ContextBlock, options?: DatabaseWriteOptions): Promise<any> {
        const conn = await this.connection();
        return conn.db().collection(domain).aggregate(pipelines).toArray();
    }

    async changes(domain: string, pipeline: any[], listener: (doc: any) => void): Promise<any> {
        const conn = await this.connection();
        conn.db().collection(domain).watch(pipeline).on("change", doc => {
            listener(doc);
        });
        return;
    }
}
