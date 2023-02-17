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
        sendMsg(ctx, 400, 'This question is not exit.');
        return;
    }
    // console.log(org_id.toString(),qns.org_id.toString());
    if (org_id.toString() !== qns.org_id.toString()) {
        sendMsg(ctx, 400, 'you can not answer it');
        return;
    }
    if (ctx.user._id.toString() === qns.user_id.toString()) {
        sendMsg(ctx, 400, "you can't answer your own answers.");
        return;
    }
    const count = await Ans.countDocuments({ question_id, user_id })
    if (count > 0) {
        sendMsg(ctx, 400, 'you alredy answer it.');
        return;
    }
    await next()
}

const inOrg = async (ctx, next) => {
    try {
        const { id } = ctx.request.params;
        const coll = ctx.request.URL.pathname.split('/')[1];
        const ansOrQns = await client.db('test').collection(coll).findOne({ _id: ObjectId(id) });
        if (!ansOrQns) {
            sendMsg(ctx, 400, `${coll == 'qns' ? 'question' : 'answer'} is not exist.`);
            return;
        }
        const userOrg = ctx.user.org_id.toString();
        if (ansOrQns.org_id.toString() !== userOrg) {
            sendMsg(ctx, 400, `you can not vote other org ${coll == 'qns' ? 'question' : 'answer'} `);
            return;
        }
        await next()
    } catch (error) {
        sendMsg(ctx,400,`id is invalid.`);
        return;
    }

}

const checkVote = async (ctx, next) => {
    const { id } = ctx.request.params;
    const user_id = ctx.user._id.toString();
    const coll = ctx.request.URL.pathname.split('/')[1];
    const inUpVote = await client.db('test').collection(coll).countDocuments({ _id: ObjectId(id), upVote: { $in: [user_id] } })
    const indownVote = await client.db('test').collection(coll).countDocuments({ _id: ObjectId(id), downVote: { $in: [user_id] } })
    if (inUpVote > 0 || indownVote > 0) {
        const msg = `your already voted this ${coll == 'ans' ? 'answer' : 'question'}.`;
        sendMsg(ctx, 400, msg);
        return;
    }
    await next()
}




module.exports = {
    canAns,
    inOrg,
    checkVote
}