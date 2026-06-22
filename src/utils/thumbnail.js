const sharp = require('sharp');

const THUMBNAIL_WIDTH = 200;

async function generateThumbnail(inputPath, outputPath) {
  await sharp(inputPath)
    .resize({ width: THUMBNAIL_WIDTH })
    .toFile(outputPath);
}

module.exports = { generateThumbnail, THUMBNAIL_WIDTH };
