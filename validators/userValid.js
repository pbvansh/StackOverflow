
const { ObjectId } = require('mongodb');
const { client } = require('../database/db');
const { sendMsg } = require('../utils/msg');
const { verifyJWT, decodeJWT } = require('../utils/jwt');
const User = client.db('test').collection('users')
const Invite = client.db('test').collection('invitation')
require('dotenv').config()

const isAllFields = async (ctx, next) => {
        const { userName, firstName, lastName, email, password, logo } = ctx.request.body;
        if (!userName || !email || !password) {
            sendMsg(ctx, 400, "Please enter valid data");
            return;
        }
        // const user = ctx.request.body;
        // Object.keys(user).forEach((key) => {
        //     user[key] = user[key].trim()
        // })
    await next();
}

const isEmail = async (ctx, next) => {
    const { email } = ctx.request.body;
    const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!reg.test(email)) {
        sendMsg(ctx, 400, 'Please provide valid email');
        return;
    }
    await next();
}

const isUniqMail = async (ctx, next) => {
    const { email } = ctx.request.body;
    const emailCount = await User.countDocuments({ email })
    if (emailCount > 0) {
        sendMsg(ctx, 400, "Email alredy registered.");
        return;
    }
    await next()
}
const isMailExsist = async (ctx, next) => {
    const { email } = ctx.request.body;
    const user = await User.findOne({ email });
    if (!user) {
        sendMsg(ctx, 400, 'email is not exist');
        return;
    }
    ctx.request.body.secret = user.password;
    await next()
}

const isUniqUserName = async (ctx, next) => {
    const { userName } = ctx.request.body;
    const { id } = ctx.request.params;
    let userNameCount;
    if (id) {
        const { upData } = ctx;
        userNameCount = await User.countDocuments({ _id: { $ne: ObjectId(id) }, userName: upData.userName })
    } else {
        userNameCount = await User.countDocuments({ userName })
    }

    if (userNameCount > 0) {
        sendMsg(ctx, 400, "user Name is alreay exist.");
        return;
    }

    await next()
}

const isLogo = async (ctx, next) => {
    const { logo } = ctx.request.body;
    const reg = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/i;
    if (logo && !reg.test(logo)) {
        sendMsg(ctx, 400, 'Please provide valid logo URL.');
        return;
    }
    await next();
}

const isPassword = async (ctx, next) => {
    const { password, oldPassword, newPassword, comfPassword } = ctx.request.body;
    if (ctx.request.url.startsWith('/user/forgotepwd/') && (!newPassword || !comfPassword)) {
        sendMsg(ctx, 400, 'please provide newPassword or comfPassword');
        return;
    } else if (ctx.request.url.startsWith('/user/changepwd') && (!newPassword || !comfPassword || !oldPassword)) {
        sendMsg(ctx, 400, 'please provide passwords');
        return;
    } else if ((ctx.request.url.startsWith('/user/signup') || ctx.request.url.startsWith('/user/login')) && (!password)) {
        sendMsg(ctx, 400, 'please provide password');
        return;
    }
    await next()
}

const checkPassword = async (ctx, next) => {
    const { password, oldPassword, newPassword, comfPassword } = ctx.request.body;
    const reg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

    if (password || oldPassword) {
        const pass = password || oldPassword;
        if (!reg.test(pass)) {
            sendMsg(ctx, 400, `Please provide valid ${password ? 'password' : 'oldPassword'}`);
            return;
        }
    }
    if (newPassword && comfPassword) {
        if (!reg.test(newPassword)) {
            sendMsg(ctx, 400, 'Please provide valid newPassword');
            return;
        }
        if (newPassword !== comfPassword) {
            sendMsg(ctx, 400, "new password and confirm password are not match.");
            return;
        }
    }
    if (oldPassword && newPassword) {
        if (oldPassword === newPassword) {
            sendMsg(ctx, 400, "please enter diffrent password.");
            return;
        }
    }
    await next();

}

const isRole = async (ctx, next) => {
    const roles = ['owner', 'admin', 'member'];
    const { role } = ctx.request.body;
    if (!roles.includes(role)) {
        sendMsg(ctx, 400, 'Role is not valid');
        return;
    }
    if (role === ctx.user.role) {
        sendMsg(ctx, 400, `${role} can not invide ${role}`);
        return;
    }
    if (ctx.user.role == 'owner') {
        ctx.request.body.org_id = ctx.user._id;
    }
    else {
        ctx.request.body.org_id = ctx.user.org_id;
    }
    await next();
}

const setRoleOrEmail = async (ctx, next) => {
    const { from } = ctx.request.query;
    if (from) {
        const { invitationId } = verifyJWT(from);
        const user = await Invite.findOne({ _id: ObjectId(invitationId) })
        if (!user) {
            sendMsg(ctx, 400, 'this invitation link is not valid.');
            return;
        }
        const isOrgExsist = await User.countDocuments({ _id: ObjectId(user.org_id) })
        if (isOrgExsist !== 1) {
            sendMsg(ctx, 400, 'this orgenazation is not exsist.');
            return;
        }

        Object.assign(ctx.request.body, {
            ...ctx.request.body,
            role: user.role,
            org_id: ObjectId(user.org_id),
            email: user.email
        })
        // ctx.request.body.role = user.role;
        // ctx.request.body.org_id = ObjectId(user.org_id);
        // ctx.request.body.email = user.email;
    } else {
        ctx.request.body.role = 'owner';
    }
    await next()
}

const isValidData = async (ctx, next) => {
    const { email, password, userName, firstName, lastName, logo } = ctx.request.body;
    if (email) {
        sendMsg(ctx, 400, 'you can not change email.');
        return;
    }
    if (password) {
        sendMsg(ctx, 400, 'you can not change password');
        return;
    } if (!userName) {
        sendMsg(ctx, 400, 'Please provide valid data');
        return;
    }
    ctx.upData = { userName, firstName, lastName, logo };
    await next();
}

const isValidLink = async (ctx, next) => {
    try {
        const { token } = ctx.request.params;
        const decodedToken = decodeJWT(token)
        const user = await User.findOne({ email: decodedToken.email });
        const verifyToken = verifyJWT(token, user.password);
        if (!verifyToken) {
            sendMsg(ctx, 400, "This link is no longer available.");
            return;
        }
        ctx.verifyToken = verifyToken;
        await next()
    } catch (e) {
        sendMsg(ctx, 400, 'Forgote password link is incorrect.');
        return;
    }

}

module.exports = {
    isAllFields,
    isEmail,
    isMailExsist,
    isUniqMail,
    isUniqUserName,
    checkPassword,
    isPassword,
    isLogo,
    isRole,
    setRoleOrEmail,
    isValidLink,
    isValidData
}