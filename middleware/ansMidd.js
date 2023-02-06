const { ObjectId, ObjectID } = require('mongodb');
const { client } = require('../database/db');
const Qns = client.db('test').collection('qns')
const Ans = client.db('test').collection('ans')

const canAns = async (ctx, next) => {
    const question_id = ObjectId(ctx.request.params.id);
    const org_id = ctx.user.org_id.toString();
    const user_id = ctx.user._id;

    ctx.request.body.org_id = org_id;
    const qns = await Qns.findOne({ _id: ObjectId(question_id) })

    if (!qns) {
        ctx.status = 400;
        ctx.body = { msg: 'This question is not exit.' };
        return;
    }
    if (org_id !== qns.org_id.toString()) {
        ctx.status = 400;
        ctx.body = { msg: 'you can not answer it' };
        return;
    }
    const count = await Ans.countDocuments({ question_id, user_id })
    if (count > 0) {
        ctx.status = 400;
        ctx.body = { msg: 'you alredy answer it.' };
        return;
    }
    await next()
}

const inOrg = async (ctx, next) => {
    const { id } = ctx.request.params;
    const coll = ctx.request.URL.pathname.split('/')[1];
    const ans = await client.db('test').collection(coll).findOne({ _id: ObjectId(id) }, { projection: { org_id: 1 } });
    if (!ans) {
        ctx.status = 400;
        ctx.body = { msg: 'answer is not exist.' }
        return;
    }
    const userOrg = ctx.user.org_id.toString();
    console.log(userOrg);
    if (ans.org_id.toString() !== userOrg) {
        ctx.status = 400;
        ctx.body = { msg: 'you can not vote other org answer' };
        return;
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
        ctx.status = 400;
        ctx.body = { msg: `your already voted this ${coll == 'ans' ? 'answer' : 'question'}.` }
        return;
    }
    await next()
}




module.exports = {
    canAns,
    inOrg,
    checkVote
}