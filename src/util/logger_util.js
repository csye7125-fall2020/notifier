const log4js = require('log4js');

log4js.configure({
    appenders: {
        err: { type: 'stderr' },
        out: { type: 'stdout' }
    },
    categories: { default: { appenders: ['err', 'out'], level: 'info' } }
});

const logger = log4js.getLogger("notifier");

module.exports = {
    logger: logger
}

// exports.bcryptCompare = function (text, hash) {
//     return bcrypt.compareSync(text, hash);
// }
// var bcryptUtil = require('../lib/utils');
// bcryptUtil.bcryptCompare(plainText, otherHashedPassword)