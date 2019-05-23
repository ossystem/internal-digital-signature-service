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
  ARE_CORS_ENABLED: {
    NO: false,
    YES: true
  },
  NEED_TO_WRITE_INTO_FILE: {
    NO: false,
    YES: true
  }
};
