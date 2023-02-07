const Bcypt = require('bcryptjs')
const { ObjectId } = require('mongodb')
const { client } = require('../database/db')
const { sendMsg } = require('../utils/msg')
const { BcyptPassword, createJWT } = require('../utils/jwt')
const User = client.db('test').collection('users')
const Invite = client.db('test').collection('invitation')

const signupUser = async (ctx) => {
    try {
        const id = new ObjectId();
        ctx.request.body = {
            ...ctx.request.body,
            _id: id,
            password: await BcyptPassword(ctx.request.body.password),
            date: new Date(),
            mDate: new Date(),
            org_id :ctx.request.body.org_id || id
        }
        await User.insertOne(ctx.request.body)
        sendMsg(ctx, 201, "signup successfully")
    } catch (error) {
        console.log(error);
        ctx.body = { msg: error }
    }
}

const loginUser = async (ctx) => {
    try {
        const { email, password } = ctx.request.body;
        const user = await User.findOne({ email })
        if (user && await Bcypt.compare(password, user.password)) {
            const data = {
                id: user._id,
                email: user.email,
                userName: user.userName,
                org_id: user.org_id,
                role: user.role,
                mDate: user.mDate
            }
            ctx.body = {
                msg: 'login successfully',
                token: createJWT(data)
            }
            return;
        } else {
            sendMsg(ctx, 400, 'invalid email or password');
        }
    } catch (error) {
        console.log(error);
    }

}

const changePassword = async (ctx) => {
    try {
        const { oldPassword, newPassword } = ctx.request.body;
        const { email } = ctx.user;
        const user = await User.findOne({ email });
        if (user && await Bcypt.compare(oldPassword, user.password)) {
            await User.updateOne({ email }, { $set: { password: await BcyptPassword(newPassword) } });
            sendMsg(ctx, 200, 'Password change successfully.');
        }
        sendMsg(ctx, 400, 'Old password is not valid. Please enter valid old password');
    } catch (error) {
        console.log(error);
    }

}

const forgotePasswordLink = async (ctx) => {
    const { email, secret } = ctx.request.body;
    const url = ctx.host + '/user/forgotepassword/' + createJWT({ email }, secret);
    ctx.body = {
        email,
        link: url
    }
}

const forgotePassword = async (ctx) => {
    const { verifyToken } = ctx;
    const { modifiedCount } = await User.updateOne({ email: verifyToken.email }, { $set: { password: await BcyptPassword(ctx.request.body.newPassword), mDate: new Date() } });
    if (modifiedCount > 0) ctx.body = { msg: 'password change successfully' };
    else {
        sendMsg(ctx, 400, 'user is not exist');
    }
    return;
}

const inviteTeamMember = async (ctx) => {
    const invitationId = await Invite.insertOne(ctx.request.body)
    const url = ctx.host + '/user/signup?from=';
    ctx.body = {
        msg: 'invitation send successfully',
        link: url + createJWT({ invitationId: invitationId.insertedId })
    }
    return;
}

const getTeam = async (ctx) => {
    const users = await User.find({ org_id: ctx.user.org_id, _id: { $ne: ctx.user.org_id } }, { projection: { password: 0 } }).toArray();
    ctx.body = users;
    return;
}

const updatedUser = async (ctx) => {
    const { id } = ctx.request.params;
    await User.updateOne({ _id: ObjectId(id) }, { $set: upData });
    ctx.body = { msg: 'user updated successfully.' }
}

const deleteUser = async (ctx) => {
    const { id } = ctx.request.params;
    await User.deleteOne({ _id: ObjectId(id) });
    ctx.body = { msg: 'user deleted successfully.' };
}

module.exports = {
    getTeam,
    signupUser,
    loginUser,
    changePassword,
    inviteTeamMember,
    forgotePasswordLink,
    forgotePassword,
    updatedUser,
    deleteUser
}