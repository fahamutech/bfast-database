import {ConfigAdapter} from "../config";

export interface DaaSAdapter {
    start(config: ConfigAdapter): Promise<boolean>;

    stop(): Promise<boolean>;
}
