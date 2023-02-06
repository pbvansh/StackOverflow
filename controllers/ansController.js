
const { ObjectId } = require('mongodb');
const { client } = require('../database/db');
const { makeUpVote, makeDownVote } = require('../utils/vote');
const Ans = client.db('test').collection('ans')

const addAns = async (ctx) => {
    const question_id = ObjectId(ctx.request.params.id);
    const user_id = ctx.user._id;
    const { ans, org_id } = ctx.request.body;
    await Ans.insertOne({
        question_id,
        user_id,
        org_id,
        ans,
        totalUpVote: 0,
        totalDownVote: 0,
        upVote: [],
        downVote: [],
        date: new Date()
    })
    ctx.status = 201;
    ctx.body = { msg: 'Thank you for your answer.' };
    return;
}

const upVote = async (ctx) => {
    const { id } = ctx.request.params;
    const user_id = ctx.user._id.toString();
    await makeUpVote('ans', id, user_id)
    ctx.body = { msg: 'upVote' };
}

const downVote = async (ctx) => {
    const { id } = ctx.request.params;
    const user_id = ctx.user._id.toString();
    await makeDownVote('ans', id, user_id)
    ctx.body = { msg: 'downVote' }
}

module.exports = {
    addAns,
    upVote,
    downVote
}