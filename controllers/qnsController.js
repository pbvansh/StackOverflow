
const { ObjectId } = require('mongodb');
const { client } = require('../database/db');
const { makeDownVote, makeUpVote } = require('../utils/vote');
const Qns = client.db('test').collection('qns')

const askQns = async (ctx) => {
    const user_id = ctx.user._id;
    const { org_id } = ctx.user;
    const { title, desc, tags } = ctx.request.body;
    await Qns.insertOne({
        user_id,
        org_id,
        title,
        desc,
        tags,
        totalUpVote: 0,
        totalDownVote: 0,
        upVote: [],
        downVote: [],
        date: new Date()
    });
    ctx.status = 201;
    ctx.body = { msg: 'Question ask successfully' };
}

const getQns = async (ctx) => {
    const { org_id } = ctx.user;
    const { sortBy, filterBy, dateBy, skip, limit } = ctx;
    // console.log(sortBy, filterBy, dateBy);
    const qns = await Qns.aggregate([{
        $match: {
            $and: [
                { org_id },
                {
                    $or: [
                        { user_id: { $eq: ctx.user._id } },
                        { totalDownVote: { $lte: 10 } },
                    ]
                }
            ]
        }
    },
    {
        $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'userName'
        }
    },
    {
        $unwind: "$userName"
    },
    {
        $lookup: {
            from: 'ans',
            localField: '_id',
            foreignField: 'question_id',
            as: 'answers'
        }
    }, {
        $unwind: {
            path: "$answers",
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $lookup: {
            from: 'users',
            localField: 'answers.user_id',
            foreignField: '_id',
            as: 'users'
        }
    }, {
        $unwind: {
            path: "$users",
            preserveNullAndEmptyArrays: true
        }
    }, {
        $sort: { "answers.totalUpVote": -1 }
    },
    {
        $group: {
            _id: "$_id",
            title: { '$first': '$title' },
            name: { '$first': '$userName.userName' },
            tags: { "$first": "$tags" },
            upVotes: { "$first": "$totalUpVote" },
            downVotes: { "$first": "$totalDownVote" },
            date: { "$first": "$date" },
            mostAns: { $sum: 1 },
            answers: {
                $push: {
                    answer: "$answers.ans",
                    userName: "$users.userName",
                    totalUpVote: "$answers.totalUpVote",
                    totalDownVote: "$answers.totalDownVote",
                    date: "$answers.date"
                }
            }
        }
    },
    {
        $match: { ...filterBy, ...dateBy } || {}
    },
    {
        $sort: Object.keys(sortBy).length === 0 ? { _id: 1 } : sortBy
    }, {
        $skip: skip
    }, {
        $limit: limit
    }
    ]).toArray()
    ctx.body = qns;
    return;
}

const updateQns = async (ctx) => {
    const user_id = ctx.user._id.toString();
    const { org_id } = ctx.user;
    const { title, desc, tags } = ctx.request.body;
    const { id } = ctx.request.params;
    await Qns.updateOne({ _id: ObjectId(id) }, { $set: { user_id, org_id, title, desc, tags } });
    ctx.body = { msg: 'question updated successfully.' };
    return;
}

const deleteQns = async (ctx) => {
    const { id } = ctx.request.params;
    await Qns.deleteOne({ _id: ObjectId(id) });
    ctx.body = { msg: 'question is delete successfully' };
    return;
}

const upVote = async (ctx) => {
    const { id } = ctx.request.params;
    const user_id = ctx.user._id.toString();
    await makeUpVote('qns', id, user_id)
    ctx.body = { msg: 'upVote' };
}

const downVote = async (ctx) => {
    const { id } = ctx.request.params;
    const user_id = ctx.user._id.toString();
    await makeDownVote('qns', id, user_id)
    ctx.body = { msg: 'downVote' }
}

module.exports = {
    askQns,
    getQns,
    updateQns,
    deleteQns,
    upVote,
    downVote
}