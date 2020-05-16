import { DaaSAdapter } from "./adapter/DaaSAdapter";
import { ConfigAdapter } from "./config";
export declare class DaaSServer implements DaaSAdapter {
    private readonly config;
    private faas;
    constructor(config: ConfigAdapter);
    start(): Promise<boolean>;
    stop(): Promise<boolean>;
    private validateOptions;
    private static setUpDatabase;
    private static registerOptions;
}
