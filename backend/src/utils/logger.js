const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');
// Directory creation handled inside log function if needed

const logFile = path.join(logDir, `${new Date().toISOString().split('T')[0]}.log`);

const log = (level, message, data = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message} ${Object.keys(data).length ? JSON.stringify(data) : ''}`;
  console.log(logEntry);

  // Only write to file in development
  if (process.env.NODE_ENV === 'development') {
    try {
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
      }
      fs.appendFileSync(logFile, logEntry + '\n');
    } catch (err) {
      // Ignore file write errors
    }
  }
};

module.exports = {
  info: (msg, data) => log('INFO', msg, data),
  error: (msg, data) => log('ERROR', msg, data),
  warn: (msg, data) => log('WARN', msg, data),
  debug: (msg, data) => log('DEBUG', msg, data),
};
