const Router = require('koa-router');
const path = require('path');
const fs = require('fs');
const upload = require('../middleware/upload');
const { generateThumbnail } = require('../utils/thumbnail');

const { UPLOAD_DIR, THUMBNAIL_DIR } = upload;

const router = new Router();

router.get('/', (ctx) => {
  ctx.body = { message: 'ok' };
});

router.post('/api/upload', upload.single('file'), async (ctx) => {
  const file = ctx.file;
  if (!file) {
    ctx.status = 400;
    ctx.body = { error: 'No file uploaded' };
    return;
  }
  const thumbResult = await generateThumbnail(file.path, path.join(THUMBNAIL_DIR, file.filename));
  ctx.body = {
    filename: file.filename,
    size: file.size,
    url: `/api/files/${file.filename}`,
    thumbnail: thumbResult.success
      ? { url: `/api/thumbnails/${file.filename}` }
      : { error: thumbResult.error },
  };
});

router.get('/api/files', async (ctx) => {
  const files = [];
  if (fs.existsSync(UPLOAD_DIR)) {
    for (const name of fs.readdirSync(UPLOAD_DIR)) {
      const full = path.join(UPLOAD_DIR, name);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) continue;
      files.push({
        filename: name,
        size: stat.size,
        uploadedAt: stat.birthtime.toISOString(),
      });
    }
  }
  ctx.body = { files };
});

router.get('/api/files/:filename', async (ctx) => {
  const filePath = path.join(UPLOAD_DIR, ctx.params.filename);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    ctx.status = 404;
    ctx.body = { error: 'File not found' };
    return;
  }
  ctx.attachment(ctx.params.filename);
  ctx.type = path.extname(ctx.params.filename);
  ctx.body = fs.createReadStream(filePath);
});

router.get('/api/thumbnails/:filename', async (ctx) => {
  const filePath = path.join(THUMBNAIL_DIR, ctx.params.filename);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    ctx.status = 404;
    ctx.body = { error: 'Thumbnail not found' };
    return;
  }
  ctx.type = path.extname(ctx.params.filename);
  ctx.body = fs.createReadStream(filePath);
});

module.exports = router;
