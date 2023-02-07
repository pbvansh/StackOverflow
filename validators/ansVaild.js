const { sendMsg } = require("../utils/msg");

const isValidAns = async (ctx, next) => {
    const { ans } = ctx.request.body;
    if (!ans) {
        sendMsg(ctx, 400, 'Please give your answer.')
    }
    if (ans.length < 5) {
        sendMsg(ctx, 400, 'answer should be more than 5 char')
    }
    if (ans.length > 10000) {
        sendMsg(ctx, 400, 'answer should be less than 10000 char')
    }
    await next()
}

module.exports = {
    isValidAns
}