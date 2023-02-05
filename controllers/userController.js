const Bcypt = require('bcryptjs')
const { ObjectId } = require('mongodb')
const { client } = require('../database/db')
const { createJWT, verifyJWT, BcyptPassword } = require('../validators/userValid')
const User = client.db('test').collection('users')

const signupUser = async (ctx) => {
    try {
        const emailCount = await User.countDocuments({ email: ctx.request.body.email })
        const userNameCount = await User.countDocuments({ userName: ctx.request.body.userName })
        if (emailCount > 0) {
            ctx.body = { msg: "Email is alreay exist." }
            return;
        }
        if (userNameCount > 0) {
            ctx.body = { msg: "user Name is alreay exist." }
            return;
        }
        ctx.request.body.password = await BcyptPassword(ctx.request.body.password)
        ctx.request.body.date = new Date();
        ctx.request.body.mDate = new Date();
        const id = new ObjectId();
        ctx.request.body._id = id
        ctx.request.body.org_id ? null : ctx.request.body.org_id = id;

        await User.insertOne(ctx.request.body)
        ctx.status = 201;
        ctx.body = { msg: "signup successfully" }
        return;

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
            ctx.body = { msg: 'invalid email or password' }
            return;
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
            ctx.body = 'Password change successfully.'
            return;
        }
        ctx.body = 'Old password is not valid. Please enter valid old password'
        return;

    } catch (error) {
        console.log(error);
    }

}

const forgotePasswordLink = async (ctx) => {
    const { email } = ctx.request.body;
    const user = await User.findOne({ email });
    if (!user) {
        ctx.body = 'email is not exist';
        return;
    }
    const url = ctx.host + '/user/forgotepwd/' + createJWT({ email, mDate: user.mDate });
    ctx.body = {
        email,
        link: url
    }
}

const forgotePassword = async (ctx) => {
    const { token } = ctx.request.params;
    const { email, mDate } = verifyJWT(token);
    const user = await User.findOne({ email });
    if (user.mDate.getTime() !== new Date(mDate).getTime()) {
        ctx.body = "This link is no longer available.";
        return;
    }
    const { modifiedCount } = await User.updateOne({ email }, { $set: { password: await BcyptPassword(ctx.request.body.newPassword), mDate: new Date() } });
    if (modifiedCount > 0) ctx.body = 'password change successfully';
    else ctx.body = 'user is not exist';
    return;
}

const inviteTeamMember = async (ctx) => {
    const url = ctx.host + '/user/signup?from=';
    console.log(ctx.request.body);
    ctx.body = {
        msg: 'invitation send successfully',
        link: url + createJWT(ctx.request.body)
    }
    return;
}
const getTeam = async (ctx) => {
    const users = await User.find({ org_id: ctx.user.org_id }, { projection: { password: 0 } }).toArray();
    ctx.body = users;
    return;
}

const updatedUser = async (ctx) => {
    const { id } = ctx.request.params;
    const { upData } = ctx;
    const userNameCount = await User.countDocuments({ _id: { $ne: ObjectId(id) }, userName: upData.userName })

    if (userNameCount > 0) {
        ctx.body = { msg: "user Name is alreay exist." }
        return;
    }
    await User.updateOne({ _id: ObjectId(id) }, { $set: upData });
    ctx.body = 'user updated successfully.'
}

const deleteUser = async (ctx) => {
    const { id } = ctx.request.params;
    await User.deleteOne({ _id: ObjectId(id) });
    ctx.body = 'user deleted successfully.';
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