import { EmailAdapter } from "../adapter/EmailAdapter";
import { MailModel } from "../model/MailModel";
import { ConfigAdapter } from "../config";
export declare class Email implements EmailAdapter {
    constructor(config: ConfigAdapter);
    sendMail(mailModel: MailModel): Promise<any>;
}
