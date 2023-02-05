
const { ObjectId } = require('mongodb');
const { client } = require('../database/db');
const Qns = client.db('test').collection('qns')
const Ans = client.db('test').collection('ans')
require('dotenv').config()


const havePermision = async (ctx, next) => {
    const { role } = ctx.user;
    const { id } = ctx.request.params;
    const org_id = ctx.user.org_id;
    // if (role === 'owner') {
    //     org_id = ctx.user._id.toString();
    // } else {
    //     org_id = ctx.user.org_id;
    // }
    if (role === 'member') {
        const user_id = ctx.user._id;
        const qns = await Qns.countDocuments({ _id: ObjectId(id), org_id, user_id });
        if (qns != 1) {
            ctx.body = "you can not make change in other person question.";
            return;
        }
    } else {
        const qns = await Qns.countDocuments({ _id: ObjectId(id), org_id });
        console.log(qns);
        if (qns != 1) {
            ctx.body = "you can not change in other orgenization question.";
            return;
        }
    }
    await next()
}

const canChange = async (ctx, next) => {
    const question_id = ctx.request.params.id;
    const count = await Ans.countDocuments({ question_id })
    if (count > 0) {
        ctx.body = 'Now you can not do any operation with this question.';
        return;
    }
    await next()
}

module.exports = {
    havePermision,
    canChange
}