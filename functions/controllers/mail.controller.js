const {functions} = require("bfast");

class MailController {

    constructor(config) {
        /**
         *
         * @type {{taarifaToken: string}}
         */
        this.config = config;
    }


    /**
     *
     * @param mailModel{{
     *     from: string,
     *     to: string,
     *     subject: string,
     *     html: string,
     *     text: string
     * }}
     * @return {Promise<*>}
     */
    async sendMail(mailModel) {
        return functions('fahamutaarifa').request('/mail').post(mailModel, {
            headers: {
                'authorization': this.config.taarifaToken
            }
        });
    }
}


module.exports = {
    MailController: MailController
}
