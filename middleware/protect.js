const JWT = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { client } = require('../database/db');
const { verifyJWT } = require('../utils/jwt');
const User = client.db('test').collection('users')
require('dotenv').config()

const protect = async (ctx, next) => {
    if (ctx.headers.authorization && ctx.headers.authorization.startsWith('Bearer')) {
        const token = ctx.headers.authorization.split(' ')[1];
        if (!token) {
            ctx.status = 401;
            ctx.body = { msg: 'Access denied. Not Authenticated...' }
            return;
        }
        try {
            const secret = process.env.JWT_SECRET;
            const { email, mDate } = JWT.verify(token, secret)
            const user = await User.findOne({ email })
            if (!user) {
                ctx.status = 401;
                ctx.body = { msg: 'Unauthorized user.' };
                return;
            }
            if (user.mDate.getTime() !== new Date(mDate).getTime()) {
                ctx.status = 401;
                ctx.body = { msg: "please log in to your account for security purposes." };
                return;
            }
            ctx.user = user;
            await next();
        } catch (err) {
            console.log(err);
            ctx.status = 401;
            ctx.body = { msg: 'Access denied. Invalid auth token...' };
            return;
        }
    } else {
        ctx.status = 401;
        ctx.body = { msg: 'Not Authorze' };
        return;
    }
}

const isAdmin = async (ctx, next) => {
    await protect(ctx, async () => {
        console.log(ctx.user.role === 'admin');
        if (ctx.user.role === 'admin') {
            await next();
        } else {
            ctx.status = 400;
            ctx.body = { msg: 'Access denied. only admin can do it.' }
            return;
        }
    })
}

const isOwner = async (ctx, next) => {
    await protect(ctx, async () => {
        if (ctx.user.role === 'owner') {
            await next();
        } else {
            ctx.status = 400;
            ctx.body = { msg: 'Access denied. only owner can do it.' };
            return;
        }
    })
}

const isAdminOrOwner = async (ctx, next) => {
    console.log('isAdminOrOwner');
    await protect(ctx, async () => {
        if (ctx.user.role === 'admin' || ctx.user.role === 'owner') {
            await next();
        } else {
            ctx.status = 400;
            ctx.body = { msg: 'Access denied. only owner or admin can do it.' };
            return;
        }
    })
}

const isValidEmail = async (ctx, next) => {
    const { token } = ctx.request.params;
    const { email } = verifyJWT(token)
    await next()
}

const havePermision = async (ctx, next) => {
    const { id } = ctx.request.params;
    await protect(ctx, async () => {
        const user_id = ctx.user._id.toString();
        if (id == user_id) {
            await next();
        } else {
            const reqOrg_id = ctx.user.org_id.toString();
            console.log(reqOrg_id)
            const role = ctx.user.role;
            console.log(role)
            const user = await User.findOne({ _id: ObjectId(id) }, { projection: { org_id: 1 } });
            if ((role === 'admin' || role === 'owner') && user?.org_id.toString() === reqOrg_id) {
                console.log('OA')
                await next();
            } else {
                ctx.status = 400;
                ctx.body = { msg: 'you have no permision.' };
                return;
            }
        }
    })
}

module.exports = {
    protect,
    isOwner,
    isAdmin,
    isValidEmail,
    isAdminOrOwner,
    havePermision
}