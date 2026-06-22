const sharp = require('sharp');

const THUMBNAIL_WIDTH = 200;

async function generateThumbnail(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .resize({ width: THUMBNAIL_WIDTH })
      .toFile(outputPath);
    return { success: true };
  } catch (err) {
    console.error('[thumbnail] failed:', err.message);
    return { error: '缩略图生成失败' };
  }
}

module.exports = { generateThumbnail, THUMBNAIL_WIDTH };
