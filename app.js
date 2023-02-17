const koa = require('koa')
const bodyParser = require('koa-bodyparser');
const { connectDB } = require('./database/db')
const userRoute = require('./routes/userRoutes')
const qnsRoute = require('./routes/qnsRoutes')
const ansRoute = require('./routes/ansRoutes')
const tagsRoute = require('./routes/tagRoutes')
require('dotenv').config()

const port = process.env.PORT;

const app = new koa();

connectDB();

app.use(bodyParser())
app.use(userRoute.routes()).use(userRoute.allowedMethods());
app.use(qnsRoute.routes()).use(qnsRoute.allowedMethods());
app.use(ansRoute.routes()).use(ansRoute.allowedMethods());
app.use(tagsRoute.routes()).use(tagsRoute.allowedMethods());
app.listen(port, () => {
    console.log(`server is run on : ${port}`);
})
