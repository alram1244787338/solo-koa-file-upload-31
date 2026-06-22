const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const router = require('./routes/index');

const app = new Koa();

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;
