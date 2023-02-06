const { client } = require('../database/db');
const Qns = client.db('test').collection('qns')

const getAllTags = async (ctx) => {
    const tag = await Qns.distinct('tags');
    console.log(tag)
    const tags = await Qns.aggregate([
        {
            $match: { org_id: ctx.user.org_id }
        },
        {
            $group: {
                _id: '$date',
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
            $sort: { "_id": -1 }
        },
        {
            $group: {
                _id: "$tags",
                dete: { $first: "$_id" }
            }
        }
    ]).toArray();
    ctx.body = tags;
}

module.exports = {
    getAllTags
}