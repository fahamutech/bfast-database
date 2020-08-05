import {FilesAdapter} from "../adapter/FilesAdapter";
import {BFastDatabaseConfig, BFastDatabaseConfigAdapter} from "../bfastDatabaseConfig";
import {SecurityController} from "../controllers/SecurityController";
import * as Minio from "minio";
import {Client} from "minio";

const url = require('url')

export class S3Storage implements FilesAdapter {
    _s3: Client;

    constructor(private readonly _security: SecurityController, private readonly config: BFastDatabaseConfigAdapter) {
        this._init(config);
    }

    async createFile(filename: string, data: any, contentType: string, options: Object): Promise<string> {
        const bucket = this.config.adapters.s3Storage.bucket;
        await this.validateFilename(filename);
        const newFilename = this._security.generateUUID() + '-' + filename;
        const bucketExist = await this._s3.bucketExists(this.config.adapters.s3Storage.bucket);
        if (bucketExist === true) {
            await this._s3.putObject(bucket, newFilename, data);
            return newFilename;
        } else {
            const endpoint = this.config.adapters.s3Storage.endPoint;
            const region = endpoint.replace('https://', '').replace('http://', '').trim().split('.')[0];
            await this._s3.makeBucket(bucket, region);
            await this._s3.putObject(bucket, newFilename, data);
            return newFilename;
        }
    }

    deleteFile(filename: string): Promise<any> {
        const bucket = this.config.adapters.s3Storage.bucket;
        return this._s3.removeObject(bucket, filename);
    }

    getFileData(filename: string): Promise<any> {
        const bucket = this.config.adapters.s3Storage.bucket;
        return this._s3.getObject(bucket, filename);
    }

    async getFileLocation(filename: string): Promise<string> {
        return '/storage/' + BFastDatabaseConfig.getInstance().applicationId + '/file/' + encodeURIComponent(filename);
    }

    async validateFilename(filename: string): Promise<any> {
        if (filename.length > 128) {
            throw 'Filename too long.';
        }

        const regx = /^[_a-zA-Z0-9][a-zA-Z0-9@. ~_-]*$/;
        if (!filename.match(regx)) {
            throw 'Filename contains invalid characters.';
        }
        return null;
    }

    handleFileStream(filename: any, request: any, response: any, contentType: any): any {
        return undefined;
    }

    async signedUrl(filename: string): Promise<string> {
        const bucket = this.config.adapters.s3Storage.bucket;
        return this._s3.presignedGetObject(bucket, filename);
    }

    canHandleFileStream = false;
    isS3 = true;

    listFiles(): Promise<any> {
        const bucket = this.config.adapters.s3Storage.bucket;
        const listStream = this._s3.listObjects(bucket);
        const files = [];
        return new Promise((resolve, _) => {
            listStream.on("data", item => {
                files.push(item);
            });
            listStream.on("end", () => {
                resolve(files);
            });
        });
    }

    private _init(config: BFastDatabaseConfigAdapter) {
        const endPoint = config.adapters.s3Storage.endPoint;
        const accessKey = config.adapters.s3Storage.accessKey;
        const secretKey = config.adapters.s3Storage.secretKey;
        const bucket = config.adapters.s3Storage.bucket;
        // Needs the required() check for `endPoint` to have run
        const ep = new url.URL(endPoint)
        const {useSSL = ep.protocol === 'https:'} = config.adapters.s3Storage;

        // Needs `useSSL`, whether it's provided or defaulted
        const {port = ep.port ? +ep.port : (useSSL ? 443 : 80)} = config.adapters.s3Storage;
        const region = config.adapters.s3Storage.endPoint
            .replace('https://', '')
            .replace('http://', '')
            .trim().split('.')[0];
        Object.assign(this, {endPoint, region: `${region}`});
        Object.assign(this, {
            bucket: typeof bucket === 'function'
                ? bucket : () => {
                    return `${bucket}`
                }
        });

        this._s3 = new Minio.Client({
            endPoint: ep.hostname, accessKey, secretKey, useSSL, port
        });
    }
}
