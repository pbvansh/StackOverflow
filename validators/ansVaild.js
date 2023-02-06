
const isValidAns = async (ctx, next) => {
    const { ans } = ctx.request.body;
    if (!ans) {
        ctx.status = 400;
        ctx.body = { msg: 'Please give your answer.' };
        return;
    }
    if (ans.length < 5) {
        ctx.status = 400;
        ctx.body = { msg: 'answer should be more than 5 char' };
        return;
    }
    if (ans.length > 10000) {
        ctx.status = 400;
        ctx.body = { msg: 'answer should be less than 10000 char' };
        return;
    }
    await next()
}

module.exports = {
    isValidAns
}