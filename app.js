const koa = require('koa')
const bodyParser = require('koa-bodyparser');
const { connectDB } = require('./database/db')
const userRoute = require('./routes/userRoutes')
const qnsRoute = require('./routes/qnsRoutes')
const ansRoute = require('./routes/ansRoutes')
require('dotenv').config()
const port = process.env.PORT;

const app = new koa();
app.use(bodyParser())

app.use(userRoute.routes()).use(userRoute.allowedMethods());
app.use(qnsRoute.routes()).use(qnsRoute.allowedMethods());
app.use(ansRoute.routes()).use(ansRoute.allowedMethods());

app.listen(port, async () => {
    await connectDB();
    console.log(`server is run on : ${port}`);
})


app.use(bodyParser())
