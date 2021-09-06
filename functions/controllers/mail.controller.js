const bfast = require("bfast");
const {EmailAdapter} = require("bfast-database-core");

class MailController extends EmailAdapter {

    constructor(config) {
        super();
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
        return bfast.functions('fahamutaarifa').request('/mail').post(mailModel, {
            headers: {
                'authorization': this.config.taarifaToken
            }
        });
    }
}


module.exports = {
    MailController: MailController
}
