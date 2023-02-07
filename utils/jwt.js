const Bcypt = require('bcryptjs')
const JWT = require('jsonwebtoken');

const createJWT = (data, sec) => {
    const secret = sec || process.env.JWT_SECRET;
    try {
        return JWT.sign(data, secret, {
            expiresIn: '7d'
        })
    } catch (error) {
        console.log(error);
    }
}


const verifyJWT = (token, sec) => {
    const secret = sec || process.env.JWT_SECRET;
    try {
        return JWT.verify(token, secret);
    } catch (error) {
        return false;
    }
}


const BcyptPassword = async (password) => {
    const salt = await Bcypt.genSalt(10);
    return Bcypt.hash(password, salt);
}

const decodeJWT = (token) => {
    return JWT.decode(token)
}


module.exports = {
    createJWT,
    verifyJWT,
    decodeJWT,
    BcyptPassword
}