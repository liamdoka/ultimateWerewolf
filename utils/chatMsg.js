const moment = require("moment")

function formatMessage(user, text) {
    return {
        user,
        text,
        time: moment().format('h:mma')
    }
}

module.exports = formatMessage;