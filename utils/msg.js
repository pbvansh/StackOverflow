
const sendMsg = (ctx, code, msg) => {
    ctx.status = code;
    ctx.body = { msg }
    return;
}

module.exports = {
    sendMsg
}