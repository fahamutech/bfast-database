import {FilesAdapter} from "../adapter/FilesAdapter";
import {BFastDatabaseConfigAdapter, BFastDatabaseConfig} from "../bfastDatabaseConfig";
import * as s3 from 'bfast-s3like';
import {SecurityController} from "../controllers/SecurityController";

let _s3;
let _security: SecurityController;

export class S3Storage implements FilesAdapter {

    constructor(security: SecurityController, config: BFastDatabaseConfigAdapter) {
        _s3 = new s3.default({
            accessKey: config.adapters.s3Storage.accessKey,
            bucket: config.adapters.s3Storage.bucket,
            endPoint: config.adapters.s3Storage.endPoint,
            secretKey: config.adapters.s3Storage.secretKey
        });
        _security = security;
    }

    async createFile(filename: string, data: any, contentType: string, options: Object): Promise<string> {
        await this.validateFilename(filename);
        const newFilename = _security.generateUUID() + '-' + filename;
        await _s3.createFile(newFilename, data, contentType);
        return newFilename;
    }

    deleteFile(filename: string): Promise<any> {
        return _s3.deleteFile(filename);
    }

    getFileData(filename: string): Promise<any> {
        return _s3.getFileData(filename);
    }

    getFileLocation(filename: string): string {
        return '/files/' + BFastDatabaseConfig.getInstance().applicationId + '/' + encodeURIComponent(filename);
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

}
