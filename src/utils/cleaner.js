const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const INTERVAL_MS = 60 * 60 * 1000;

function cleanDirectory(dir) {
  if (!fs.existsSync(dir)) return 0;
  let deleted = 0;
  const now = Date.now();
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      deleted += cleanDirectory(full);
      continue;
    }
    if (now - stat.mtimeMs > MAX_AGE_MS) {
      fs.unlinkSync(full);
      deleted++;
    }
  }
  return deleted;
}

function cleanExpiredFiles() {
  const deleted = cleanDirectory(UPLOAD_DIR);
  console.log(`[cleaner] removed ${deleted} expired file(s)`);
  return deleted;
}

function startCleaner(intervalMs = INTERVAL_MS) {
  cleanExpiredFiles();
  const timer = setInterval(cleanExpiredFiles, intervalMs);
  if (timer.unref) timer.unref();
  return timer;
}

module.exports = { cleanExpiredFiles, startCleaner, MAX_AGE_MS, INTERVAL_MS };
