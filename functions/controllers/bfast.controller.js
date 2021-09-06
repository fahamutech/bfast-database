const {EnvUtil} = require("bfast-database-core");
const envUtil = new EnvUtil();
const _config = {
    rsaKeyPairInJson: {
        "p": "zULI9aVyYabSWFLeGiYQXEu7Sql732aFEurqFeP14P2yN-4x9KIPVbHed8gAyPJOwgC3_IvZkF_zOPgwz1M-kbWBdcaJv2uG9LP8QlWvqAW9V6PpaiaDZvYWgsWCu2rEJTzLZev47drvimtw7iHHPRcPrBoRZsQ4VpnSml-Xb_E",
        "kty": "RSA",
        "q": "vueCAtz91YFBfAZ80k5vukbkBeYFUuYYwPtzdqLNzfvKvm9fe4jvPbg3HNxzrIuxhYJGMsOirpE4Fpy_Tsm8UZFbZIEYqi0nNrHWaiE5RaOQ2k5OWalnsJ9bhchtDJ-q7t72mpq5ZFb-b1BAMb1NsU8B2_-JuCgrKDZZI4sim3c",
        "d": "MBNeHNrlnC5Cc3pr2qZI3g0EdvLs2vUziUtsWfm2sVRXME1X1cdOMQ48IfHnnwK2Lct9v3J9suq-Y3bb7fGOyF_ckYqGLFZrjFFR7dOAPabdtxJ0rW9p7-8Uk8Pnj5GR1jAC--8Y2NJiU5k2VvKcCy3NYuByU8wTyQJKxVYF1aMsBCp8pHMkve1y8DW9Dt987rIlHK11lNmy93IzeXAn2bRFAxV6J8383v5bk3CdMrr_9n1NSNxu_qlekKGA1w-haZ01P1adD21tuUxZ5HhkgsDce4sHhTzvQM7gLKnTtawLUjKI4AqhCUOdKaoar1JCZHpui6t2orBm-uB9lseBAQ",
        "e": "AQAB",
        "use": "sig",
        "qi": "HvelfjLNaDpIzZr9IDIJgg532kFYORc_DnhUWrEkDA3-EjXPiOb4tHzBDjJ-OizPECLjVFRLRzRQhwej5ZOI9vuJdX-vRO4Wx5gpQ0EQxHDp4nByV5Z3HjjJvnFV0QDgoxCHVNwnltUqO-xS0VEiMNooiLPQ97GSkNmKTMIZwg8",
        "dp": "msX2FExJwFpzF4h80wjKo12zfyvnLN_4Dfi2xATdXWbO4J-qaYVdvMdfMcDM3rjfLCgwk6y8Q8Il-1oiK-LgNiy_zpgDPCSPYarp1vcXecHCMPh2w8UApj1_YeIensV124JI-LSDQo8oup4jTFyKCIWAGsyZPH1O4fYhOKhF33E",
        "alg": "RS256",
        "dq": "eGuYey3jgFY0dIOzIQYRPDOTipT6LryuSK1UvDUeFR0LWuzuEgLixs_5E9-Lp__GTy1KEqONbwhzlO_zTUO74sgKGm_EmzQ4VCwB0Jh8hA0VRl-21KAjpCohlVZEU340WNGURRnsb_rgLF823ylGZN4tkhSzTtMnxgniWKVfgyk",
        "n": "mREwp9w2aYM3cLBL4MkF7JJ80NT3UVATFZPR5s3Dcg8HuAWsQ6VPZrvPpdVWEwhSlkICUy46xOfWyXFRJeBR6ICb04O6PXIFAj_alFCRE-NJszEycUaiKxgIynpSBuETGZfX8-M0uzCXtFQY4Cxpb9rlPo4kqraRU1pJ64OSTYZkwc4D8C2rFM1_WfXnCkvml_vK7Knq_YJdanWQQMPmBK7LE8Yi06PLl2UCaFANQ2axZIN0iTayfnTNkShzMDA5DogRp8tcCm8N7nR96UH9Bc2J9E0YSVt6QSZt-83CQ4pzs3XtQZdfFAoc66OltadoqXyGrvj5F6gq4WB62S30Bw"
    },
    rsaPublicKeyInJson: {
        "kty": "RSA",
        "e": "AQAB",
        "use": "sig",
        "alg": "RS256",
        "n": "mREwp9w2aYM3cLBL4MkF7JJ80NT3UVATFZPR5s3Dcg8HuAWsQ6VPZrvPpdVWEwhSlkICUy46xOfWyXFRJeBR6ICb04O6PXIFAj_alFCRE-NJszEycUaiKxgIynpSBuETGZfX8-M0uzCXtFQY4Cxpb9rlPo4kqraRU1pJ64OSTYZkwc4D8C2rFM1_WfXnCkvml_vK7Knq_YJdanWQQMPmBK7LE8Yi06PLl2UCaFANQ2axZIN0iTayfnTNkShzMDA5DogRp8tcCm8N7nR96UH9Bc2J9E0YSVt6QSZt-83CQ4pzs3XtQZdfFAoc66OltadoqXyGrvj5F6gq4WB62S30Bw"
    },
    taarifaToken: envUtil.getEnv(process.env.TAARIFA_TOKEN) ?
        envUtil.getEnv(process.env.TAARIFA_TOKEN) :
        'fzJogB87b8D3gTxU0u6utUx4CELiI24M7LSJMmfVZE7bjFmb2guNIcsiktQQPB8',
}
let myConfig = envUtil.loadEnv();
module.exports.config = Object.assign(myConfig, _config);
