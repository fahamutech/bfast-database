import {AuthAdapter} from "../adapter/AuthAdapter";
import {ConfigAdapter} from "../config";

export class Auth implements AuthAdapter {
    constructor(private readonly config: ConfigAdapter) {
    }
}
