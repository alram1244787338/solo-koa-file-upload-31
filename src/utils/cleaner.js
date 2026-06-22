const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const INTERVAL_MS = 60 * 60 * 1000;

function cleanDirectory(dir) {
  if (!fs.existsSync(dir)) return { files: 0, dirs: 0 };
  let deletedFiles = 0;
  let deletedDirs = 0;
  const now = Date.now();
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      const sub = cleanDirectory(full);
      deletedFiles += sub.files;
      deletedDirs += sub.dirs;
      continue;
    }
    if (now - stat.mtimeMs > MAX_AGE_MS) {
      fs.unlinkSync(full);
      deletedFiles++;
    }
  }
  if (dir !== UPLOAD_DIR && fs.readdirSync(dir).length === 0) {
    fs.rmdirSync(dir);
    deletedDirs++;
  }
  return { files: deletedFiles, dirs: deletedDirs };
}

function cleanExpiredFiles() {
  const result = cleanDirectory(UPLOAD_DIR);
  console.log(`[cleaner] removed ${result.files} expired file(s), ${result.dirs} empty dir(s)`);
  return result;
}

function startCleaner(intervalMs = INTERVAL_MS) {
  const firstRun = setTimeout(() => {
    cleanExpiredFiles();
  }, 1000);
  if (firstRun.unref) firstRun.unref();

  const timer = setInterval(cleanExpiredFiles, intervalMs);
  if (timer.unref) timer.unref();

  return { firstRun, timer };
}

module.exports = { cleanExpiredFiles, startCleaner, MAX_AGE_MS, INTERVAL_MS };
