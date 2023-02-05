const Bcypt = require('bcryptjs')
const JWT = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
require('dotenv').config()

const isAllFields = async (ctx, next) => {
    if (ctx.request.method === "POST") {
        const { userName, firstName, lastName, email, password, logo } = ctx.request.body;
        if (!userName || !email || !password) {
            ctx.body = { msg: "Please enter valid data" };
            return;
        }
    }
    await next();
}

const isEmail = async (ctx, next) => {
    const { email } = ctx.request.body;
    const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    reg.test(email) ? await next() : ctx.body = { msg: 'Please provide valid email' };
    return;
}

const isPassword = async (ctx, next) => {
    const { password, oldPassword, newPassword, comfPassword } = ctx.request.body;
    if (ctx.request.url.startsWith('/user/forgotepwd/') && (!newPassword || !comfPassword)) {
        ctx.body = 'please provide newPassword or comfPassword';
        return;
    } else if (ctx.request.url.startsWith('/user/changepwd') && (!newPassword || !comfPassword || !oldPassword)) {
        ctx.body = 'please provide passwords';
        return;
    } else if ((ctx.request.url.startsWith('/user/signup') || ctx.request.url.startsWith('/user/login')) && (!password)) {
        ctx.body = 'please provide password';
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
            ctx.body = { msg: `Please provide valid ${password ? 'password' : 'oldPassword'}` };
            return;
        }
    }
    if (newPassword && comfPassword) {
        if (!reg.test(newPassword)) {
            ctx.body = { msg: 'Please provide valid newPassword' };
            return;
        }
        if (newPassword !== comfPassword) {
            ctx.body = { msg: "new password and confirm password are not match." };
            return;
        }
    }
    await next();

}

const isRole = async (ctx, next) => {
    const roles = ['owner', 'admin', 'member'];
    const { role } = ctx.request.body;
    if (!roles.includes(role)) {
        ctx.body = 'Role is not valid';
        return;
    }
    if (role === ctx.user.role) {
        ctx.body = `${role} can not invide ${role}`;
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
        const { role, email, org_id } = verifyJWT(from);
        ctx.request.body.role = role;
        ctx.request.body.org_id = ObjectId(org_id);
        ctx.request.body.email = email;
    } else {
        ctx.request.body.role = 'owner';
    }
    await next()
}

const isValidData = async (ctx, next) => {
    const { email, password, userName, firstName, lastName, logo } = ctx.request.body;
    if (email) {
        ctx.body = 'you can not change email.';
        return;
    } if (password) {
        ctx.body = 'you can not change password';
        return;
    } if (!userName) {
        ctx.body = 'Please provide valid data';
        return;
    }
    ctx.upData = { userName, firstName, lastName, logo };
    await next();
}

const createJWT = (data) => {
    try {
        return JWT.sign(data, process.env.JWT_SECRET, {
            expiresIn: '7d'
        })
    } catch (error) {
        console.log(error);
    }
}

const verifyJWT = (token) => {
    try {
        return JWT.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        console.log(error);
    }
}

const BcyptPassword = async (password) => {
    const salt = await Bcypt.genSalt(10);
    return (await Bcypt.hash(password, salt))
}

const decodeJWT = () => {

}

module.exports = {
    isAllFields,
    isEmail,
    checkPassword,
    isPassword,
    isRole,
    setRoleOrEmail,
    createJWT,
    verifyJWT,
    BcyptPassword,
    isValidData
}