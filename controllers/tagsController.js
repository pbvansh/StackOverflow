const { client } = require('../database/db');
const Qns = client.db('test').collection('qns')

const getAllTags = async (ctx) => {
    // const tag = await Qns.distinct('tags');
    // console.log(tag)
    const tags = await Qns.aggregate([
        {
            $match: { org_id: ctx.user.org_id }
        },
        {
            $group: {
                _id: '$mDate',
                tags: { $push: "$tags" }
            }
        },
        {
            $unwind: '$tags'
        },
        {
            $unwind: '$tags'
        },
        {
            $group: {
                _id: "$tags",
                date: { $first: "$_id" }
            }
        },
        {
            $sort: { date: -1 }
        },
    ]).toArray();
    ctx.body = tags;
}

module.exports = {
    getAllTags
}