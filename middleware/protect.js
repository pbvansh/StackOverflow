const JWT = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { client } = require('../database/db');
const { sendMsg } = require('../utils/msg');
const User = client.db('test').collection('users')
require('dotenv').config()

const protect = async (ctx, next) => {
    if (ctx.headers.authorization && ctx.headers.authorization.startsWith('Bearer')) {
        const token = ctx.headers.authorization.split(' ')[1];
        if (!token) {
            sendMsg(ctx, 401, 'Access denied. Not Authenticated...');
            return;
        }
        try {
            const secret = process.env.JWT_SECRET;
            const { email, mDate } = JWT.verify(token, secret)
            const user = await User.findOne({ email })
            if (!user) {
                sendMsg(ctx, 401, 'Unauthorized user.');
                return;
            }
            const org = await User.findOne({ _id: user.org_id })
            if(!org){
                sendMsg(ctx, 401, 'Your organization is not exists.');
                return;
            }
            if (user.mDate.getTime() !== new Date(mDate).getTime()) {
                sendMsg(ctx, 401, "please log in to your account for security purposes.");
                return;
            }
            ctx.user = user;
            await next();
        } catch (err) {
            console.log(err);
            sendMsg(ctx, 401, 'Access denied. Invalid auth token...');
            return;
        }
    } else {
        sendMsg(ctx, 401, 'Not Authorze');
        return;
    }
}

const isAdmin = async (ctx, next) => {
    await protect(ctx, async () => {
        if (ctx.user.role === 'admin') {
            await next();
        } else {
            sendMsg(ctx, 400, 'Access denied. only admin can do it.');
            return;
        }
    })
}

const isOwner = async (ctx, next) => {
    await protect(ctx, async () => {
        if (ctx.user.role === 'owner') {
            await next();
        } else {
            sendMsg(ctx, 400, 'Access denied. only owner can do it.');
            return;
        }
    })
}

const isAdminOrOwner = async (ctx, next) => {
    await protect(ctx, async () => {
        if (ctx.user.role === 'admin' || ctx.user.role === 'owner') {
            await next();
        } else {
            sendMsg(ctx, 400, 'Access denied. only owner or admin can do it.');
            return;
        }
    })
}

const havePermision = async (ctx, next) => {
    const { id } = ctx.request.params;
    await protect(ctx, async () => {
        const user_id = ctx.user._id.toString();
        if (id == user_id) {
            await next();
        } else {
            const reqOrg_id = ctx.user.org_id.toString();
            const role = ctx.user.role;
            const user = await User.findOne({ _id: ObjectId(id) }, { projection: { org_id: 1 } });
            if ((role === 'admin' || role === 'owner') && user?.org_id.toString() === reqOrg_id) {
                await next();
            } else {
                sendMsg(ctx, 400, 'you have no permision.');
                return;
            }
        }
    })
}

module.exports = {
    protect,
    isOwner,
    isAdmin,
    isAdminOrOwner,
    havePermision
}