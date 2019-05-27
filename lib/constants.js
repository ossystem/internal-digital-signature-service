module.exports = {
  ENVIRONMENT: {
    DEV: 'dev',
    PROD: 'prod'
  },
  PROTOCOL: {
    HTTP: 'http',
    HTTPS: 'https'
  },
  HTTP_ERRORS: {
    400: 'Invalid parameters',
    404: 'Route not found',
    429: 'Request limit exceeded',
    500: 'Server error'
  },
  LOG_LEVEL: {
    INFO: {
      ID: 0,
      TEXT: 'INF'
    },
    DEBUG: {
      ID: 1,
      TEXT: 'DBG'
    },
    WARNING: {
      ID: 2,
      TEXT: 'WRN'
    },
    EXCEPTION: {
      ID: 3,
      TEXT: 'EXC'
    },
    ERROR: {
      ID: 4,
      TEXT: 'ERR'
    },
    CRITICAL: {
      ID: 5,
      TEXT: 'CRI'
    }
  },
  ARE_CORS_ENABLED: {
    NO: false,
    YES: true
  },
  NEED_TO_WRITE_INTO_FILE: {
    NO: false,
    YES: true
  },
  NEED_TO_ENABLE_REQUESTS_LOGGER: {
    NO: false,
    YES: true
  }
};
