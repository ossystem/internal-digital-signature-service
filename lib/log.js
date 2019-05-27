const debug = require('debug')('app');
const {
  LOG_LEVEL: {
    INFO,
    DEBUG,
    WARNING,
    ERROR,
    EXCEPTION,
    CRITICAL
  }
} = require('./constants');

const log = (line = '?', level = DEBUG.ID, text = '', details = '') => {
  try {
    text = text.toString().trim();
  } catch (ex) {
    debug(ex.message || ex);
    return;
  }

  try {
    if (!!details && (typeof details === 'object')) {
      details = JSON.stringify(details);
    } else {
      details = details.toString().trim();
    }
  } catch (ex) {
    debug(ex.message || ex);
    return;
  }

  switch (level) {
    case DEBUG.ID:
      text = `[${DEBUG.TEXT}] ${text}`;
      break;
    case WARNING.ID:
      text = `[${WARNING.TEXT}] ${text}`;
      break;
    case EXCEPTION.ID:
      text = `[${EXCEPTION.TEXT}] ${text}`;
      break;
    case ERROR.ID:
      text = `[${ERROR.TEXT}] ${text}`;
      break;
    case CRITICAL.ID:
      text = `[${CRITICAL.TEXT}] ${text}`;
      break;
    default:
      text = `[${INFO.TEXT}] ${text}`;
  }

  const ts = Date.now();

  if (details) {
    debug(line, ts, text, details);
  } else {
    debug(line, ts, text);
  }
};

module.exports = {
  info (line, text, details) {
    log(line, INFO.ID, text, details);
  },
  debug (line, text, details) {
    log(line, DEBUG.ID, text, details);
  },
  warning (line, text, details) {
    log(line, WARNING.ID, text, details);
  },
  exception (line, text, details) {
    log(line, EXCEPTION.ID, text, details);
  },
  error (line, text, details) {
    log(line, ERROR.ID, text, details);
  },
  critical (line, text, details) {
    log(line, CRITICAL.ID, text, details);
  }
};
