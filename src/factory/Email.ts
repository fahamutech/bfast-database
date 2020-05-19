import {EmailAdapter} from "../adapter/EmailAdapter";
import {MailModel} from "../model/MailModel";
import {ConfigAdapter} from "../utils/config";

export class Email implements EmailAdapter {
    constructor(config: ConfigAdapter) {
    }

    sendMail(mailModel: MailModel): Promise<any> {
        return Promise.reject("Not implemented yet");
    }

}
