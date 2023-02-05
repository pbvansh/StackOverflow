const { ObjectId } = require('mongodb');
const { client } = require('../database/db')

const makeUpVote = async (coll, id, user_id) => {
    const collection = client.db('test').collection(coll)
    await collection.updateOne({ _id: ObjectId(id) }, { $push: { upVote: user_id } })
    await collection.updateOne({ _id: ObjectId(id) }, { $inc: { totalUpVote: 1 } })
    return;
}
const makeDownVote = async (coll, id, user_id) => {
    const collection = client.db('test').collection(coll)
    await collection.updateOne({ _id: ObjectId(id) }, { $push: { downVote: user_id } })
    await collection.updateOne({ _id: ObjectId(id) }, { $inc: { totalDownVote: 1 } })
    return;
}

module.exports = {
    makeDownVote,
    makeUpVote
}