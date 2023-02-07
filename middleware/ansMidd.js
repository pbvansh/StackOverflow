const { ObjectId, ObjectID } = require('mongodb');
const { client } = require('../database/db');
const { sendMsg } = require('../utils/msg');
const Qns = client.db('test').collection('qns')
const Ans = client.db('test').collection('ans')

const canAns = async (ctx, next) => {
    const question_id = ObjectId(ctx.request.params.id);
    const { org_id, _id: user_id } = ctx.user;
    ctx.request.body.org_id = org_id;
    const qns = await Qns.findOne({ _id: question_id })

    if (!qns) {
        sendMsg(ctx, 400, 'This question is not exit.')
    }
    if (org_id.toString() !== qns.org_id.toString()) {
        sendMsg(ctx, 400, 'you can not answer it')
    }
    if (ctx.user._id.toString() === qns.user_id.toString()) {
        sendMsg(ctx, 400, "you can't answer own answers.")
    }
    const count = await Ans.countDocuments({ question_id, user_id })
    if (count > 0) {
        sendMsg(ctx, 400, 'you alredy answer it.')
    }
    await next()
}

const inOrg = async (ctx, next) => {
    const { id } = ctx.request.params;
    const coll = ctx.request.URL.pathname.split('/')[1];
    const ans = await client.db('test').collection(coll).findOne({ _id: ObjectId(id) }, { projection: { org_id: 1 } });
    if (!ans) {
        sendMsg(ctx, 400, 'answer is not exist.')
    }
    const userOrg = ctx.user.org_id.toString();
    if (ans.org_id.toString() !== userOrg) {
        sendMsg(ctx, 400, 'you can not vote other org answer')
    }
    await next()
}

const checkVote = async (ctx, next) => {
    const { id } = ctx.request.params;
    const user_id = ctx.user._id.toString();
    const coll = ctx.request.URL.pathname.split('/')[1];
    const inUpVote = await client.db('test').collection(coll).countDocuments({ _id: ObjectId(id), upVote: { $in: [user_id] } })
    const indownVote = await client.db('test').collection(coll).countDocuments({ _id: ObjectId(id), downVote: { $in: [user_id] } })
    if (inUpVote > 0 || indownVote > 0) {
        const msg = `your already voted this ${coll == 'ans' ? 'answer' : 'question'}.`;
        sendMsg(ctx, 400, msg)
    }
    await next()
}




module.exports = {
    canAns,
    inOrg,
    checkVote
}