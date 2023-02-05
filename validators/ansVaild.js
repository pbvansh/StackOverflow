
const isValidAns = async (ctx, next) => {
    const { ans } = ctx.request.body;
    if (!ans) {
        ctx.body = 'Please give your answer.';
        return;
    }
    if (ans.length < 5) {
        ctx.body = 'answer should be more than 5 char';
        return;
    }
    if (ans.length > 10000) {
        ctx.body = 'answer should be less than 10000 char';
        return;
    }
    await next()
}

module.exports = {
    isValidAns
}