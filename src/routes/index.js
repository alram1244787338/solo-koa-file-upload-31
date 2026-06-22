const Router = require('koa-router');

const router = new Router();

router.get('/', (ctx) => {
  ctx.body = { message: 'ok' };
});

module.exports = router;
