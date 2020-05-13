export interface EmailAdapter {
    sendMail(mailModel: MailModel): Promise<any>;
}
