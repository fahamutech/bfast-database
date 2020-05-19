import {ConfigAdapter} from "../utils/config";

export interface DaaSAdapter {
    start(config: ConfigAdapter): Promise<boolean>;

    stop(): Promise<boolean>;
}
