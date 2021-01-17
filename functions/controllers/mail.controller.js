const {bfast} = require("bfastnode");
const {EmailAdapter} = require("bfast-database-core");

class MailController extends EmailAdapter{

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
     * @param mailModel
     * @return {Promise<*>}
     */
    async sendMail(mailModel) {
        return bfast.functions('fahamutaarifa').request('/mail').post({

        }, {
            headers: {
                'authorization': this.config.taarifaToken
            }
        })
    }
}


module.exports = {
    MailController: MailController
}
