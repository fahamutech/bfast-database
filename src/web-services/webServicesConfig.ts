import {BFastDatabaseConfig, BFastDatabaseConfigAdapter} from "../bfastDatabaseConfig";
import {SecurityController} from "../controllers/SecurityController";
import {FilesAdapter} from "../adapter/FilesAdapter";
import {S3Storage} from "../factory/S3Storage";
import {GridFsStorage} from "../factory/GridFsStorage";
import {RestController} from "../controllers/RestController";
import {StorageController} from "../controllers/StorageController";
import {DatabaseController} from "../controllers/DatabaseController";
import {Database} from "../factory/Database";

export const getRestController = function () {
    const config: BFastDatabaseConfigAdapter = BFastDatabaseConfig.getInstance();
    const securityController = new SecurityController();
    const filesAdapter = (config && config.adapters && config.adapters.s3Storage)
        ? new S3Storage(securityController, config)
        : new GridFsStorage(securityController)
    const storageController = new StorageController(filesAdapter);

    return new RestController(securityController, storageController);
}

export const getStorageController = function () {
    const config: BFastDatabaseConfigAdapter = BFastDatabaseConfig.getInstance();
    const filesAdapter: FilesAdapter = (config && config.adapters && config.adapters.s3Storage)
        ? new S3Storage(new SecurityController(), config)
        : new GridFsStorage(new SecurityController(), config.mongoDbUri);
    return new StorageController(filesAdapter);
}

export const getDatabaseController = function () {
    const config: BFastDatabaseConfigAdapter = BFastDatabaseConfig.getInstance();
    return new DatabaseController(
        (config.adapters && config.adapters.database) ?
            this.config.adapters.database(config) : new Database(config),
        new SecurityController()
    );
}
