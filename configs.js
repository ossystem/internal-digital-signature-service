const {
  ENVIRONMENT: {DEV, PROD},
  PROTOCOL: {HTTP},
  ARE_CORS_ENABLED,
  NEED_TO_WRITE_INTO_FILE
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
  CORS_ENABLED = ARE_CORS_ENABLED.YES,
  WRITE_INTO_FILE = NEED_TO_WRITE_INTO_FILE.NO,
  KEY_FILE_NAME = 'key.dat',
  KEY_PASSWORD,
  CERTIFICATE_FILE_NAME = 'certificate.cer',
  SIGNED_DATA_FILE_NAME = 'signedData.p7s',
  PARSED_DATA_FILE_NAME = 'decrypted.txt'
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
      text: {
        limit: '256kb'
      }
    },
    corsConfigs: {  // https://www.npmjs.com/package/cors
      enabled: CORS_ENABLED.toString() === ARE_CORS_ENABLED.YES.toString(),
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
    writeIntoFile: WRITE_INTO_FILE.toString() === NEED_TO_WRITE_INTO_FILE.YES.toString(),
    keyFileName: KEY_FILE_NAME,
    keyPassword: KEY_PASSWORD,
    certificateFileName: CERTIFICATE_FILE_NAME,
    signedDataFileName: SIGNED_DATA_FILE_NAME,
    parsedDataFileName: PARSED_DATA_FILE_NAME
  }
};
