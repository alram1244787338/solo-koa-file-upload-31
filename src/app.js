const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const router = require('./routes/index');
const { startCleaner } = require('./utils/cleaner');

const app = new Koa();

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    const msg = err.message || 'Internal Server Error';
    if (msg.includes('Only image') || err.code === 'LIMIT_FILE_SIZE') {
      ctx.status = 400;
    } else {
      ctx.status = err.status || 500;
    }
    ctx.body = { error: msg };
  }
});

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

startCleaner();

module.exports = app;
