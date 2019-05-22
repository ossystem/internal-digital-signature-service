const {
  ENVIRONMENT: {DEV, PROD},
  PROTOCOL: {HTTP}
} = require('./lib/constants');

const {
  NODE_ENV = PROD,
  PROTOCOL = HTTP,
  HOST = '0.0.0.0',
  PORT = 3000,
  SSL_PORT = 443,
  RATE_LIMIT_MAX = 10,
  RATE_LIMIT_WINDOW = 1,
  RATE_LIMIT_BLOCK_DURATION = 60 * 60 * 24,
  CORS_ENABLED = true,
  KEY_FILE_NAME = 'key.dat',
  KEY_PASSWORD,
  CERTIFICATE_FILE_NAME = 'certificate.cer',
  SIGNED_DATA_FILE_NAME = 'signedData.p7s'
} = process.env;

module.exports = {
  isDevelopment: NODE_ENV === DEV,
  server: {
    protocol: PROTOCOL,
    host: HOST,
    port: PORT,
    sslPort: SSL_PORT
  },
  middlewares: {
    rateLimit: {  // https://www.npmjs.com/package/rate-limiter-flexible
      points: RATE_LIMIT_MAX,
      duration: RATE_LIMIT_WINDOW,  // seconds
      blockDuration: RATE_LIMIT_BLOCK_DURATION  // seconds
    },
    bodyParser: {  // https://www.npmjs.com/package/body-parser
      json: {
        limit: '256kb'
      },
      urlencoded: {
        limit: '256kb',
        parameterLimit: 1,
        extended: false
      }
    },
    corsConfigs: {  // https://www.npmjs.com/package/cors
      enabled: CORS_ENABLED,
      allowedOrigin: '*',
      allowedMethods: [
        'GET',
        'POST',
        'OPTIONS'
      ],
      allowedHeaders: [
        'Accept',
        'Content-Type',
        'Origin',
        'X-Requested-With'
      ]
    }
  },
  signingSettings: {
    keyFileName: KEY_FILE_NAME,
    keyPassword: KEY_PASSWORD,
    certificateFileName: CERTIFICATE_FILE_NAME,
    signedDataFileName: SIGNED_DATA_FILE_NAME
  }
};
