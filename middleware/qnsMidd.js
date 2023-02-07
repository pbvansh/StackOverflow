
const { ObjectId } = require('mongodb');
const { client } = require('../database/db');
const { sendMsg } = require('../utils/msg');
const Qns = client.db('test').collection('qns')
const Ans = client.db('test').collection('ans')
require('dotenv').config()


const havePermision = async (ctx, next) => {
    const { role, org_id } = ctx.user;
    const { id } = ctx.request.params;
    if (role === 'member') {
        const user_id = ctx.user._id;
        const qns = await Qns.countDocuments({ _id: ObjectId(id), org_id, user_id });
        if (qns != 1) {
            sendMsg(ctx, 400, "you can not make change in other person question.")
        }
    } else {
        const qns = await Qns.countDocuments({ _id: ObjectId(id), org_id });
        console.log(qns);
        if (qns != 1) {
            sendMsg(ctx, 400, "you can not make change in other person question.")
        }
    }
    await next()
}

const canChange = async (ctx, next) => {
    const question_id = ctx.request.params.id;
    const count = await Ans.countDocuments({ question_id })
    if (count > 0) {
        sendMsg(ctx, 401, 'Now you can not do any operation with this question.')
    }
    await next()
}

module.exports = {
    havePermision,
    canChange
}