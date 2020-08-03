import {BFastDatabaseConfig, BFastDatabaseConfigAdapter} from "../bfastDatabaseConfig";
import {DatabaseController} from "../controllers/DatabaseController";
import {Database} from "../factory/Database";
import {SecurityController} from "../controllers/SecurityController";
import {FilesAdapter} from "../adapter/FilesAdapter";
import {S3Storage} from "../factory/S3Storage";
import {GridFsStorage} from "../factory/GridFsStorage";
import {RestController} from "../controllers/RestController";

export const getRestController = function () {
    const config: BFastDatabaseConfigAdapter = BFastDatabaseConfig.getInstance();

    const databaseController: DatabaseController = new DatabaseController(
        (config && config.adapters && config.adapters.database)
            ? config.adapters.database(config)
            : new Database(config),
        new SecurityController()
    );

    const filesAdapter: FilesAdapter = (config && config.adapters && config.adapters.s3Storage)
        ? new S3Storage(new SecurityController(), config)
        : new GridFsStorage(new SecurityController(), config.mongoDbUri);

    return  new RestController(new SecurityController(), filesAdapter);
}
