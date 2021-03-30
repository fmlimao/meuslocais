const axios = require('axios');
const https = require('https');
const base64 = require('base-64');
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});
const logging = process.env.APP_DEBUG;

const redis = require('./redis');

function getAuth() {
    const username = process.env.MS_IDM_API_USERNAME;
    const password = process.env.MS_IDM_API_PASSWORD;
    return 'Basic ' + base64.encode(username + ':' + password);
}

function log(msg) {
    if (logging == '1') {
        console.log(`MSIDM.getUsersData() -> ${msg}`);
    }
}

async function getUsersData(ids = [], fields = [], forceUseApi = false) {
    try {
        let ret = {};

        const formattedIds = {
            listaIds: ids.map(id => {
                return {
                    usuarioId: id,
                };
            }),
        };

        log(`forceUseApi: ${forceUseApi}`);

        if (forceUseApi === true) {
            log('buscando na api');
            log('inicio ajax');

            const ajaxData = (await axios.post(process.env.MS_IDM_API_PATH, [], {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': getAuth(),
                },
                httpsAgent,
            })).data;

            ret = {};

            if (ajaxData.data && typeof ajaxData.data == 'object') {
                for (let i in ajaxData.data) {
                    if (ajaxData.data[i].usuarioId) {
                        ret[ajaxData.data[i].usuarioId] = ajaxData.data[i];
                    }
                }
            }

            log('fim ajax, salvando no redis');

            await redis.set('ms-idm-users', ret);
        }

        ret = {}

        log('buscando no redis');

        const usersRedis = await redis.get('ms-idm-users');
        log(`usersRedis: ${usersRedis !== null}`);

        if (usersRedis) {
            log('tem registros');

            if (ids.length == 0) {
                log('ids.length == 0, então retorno todos');
                return usersRedis;
            }

            log(`ids.length == ${ids.length}, então percorro os usuarios e retorno apenas os solicitados`);
            for (let i in ids) {
                const usuarioId = ids[i];
                if (usersRedis[usuarioId]) {
                    ret[usuarioId] = {};

                    for (let j in fields) {
                        let field = fields[j];

                        if (typeof usersRedis[usuarioId][field] !== 'undefined') {
                            ret[usuarioId][field] = usersRedis[usuarioId][field];
                        }
                    }
                }
            }

            return ret;
        }

        log('nao tem registros');

        if (forceUseApi === false) {
            log('busca na api (recursivo)');
            return await getUsersData(ids, fields, true);
        }

        return ret;

    } catch (error) {
        log(`error: ${error.message}`);
        return {};
    }
}

module.exports = {
    getUsersData,
};