const {
  ENVIRONMENT: {DEV, PROD},
  NEED_TO_WRITE_INTO_FILE,
} = require('./lib/constants');

const {
  DEBUG = 'app',
  NODE_ENV = PROD,
  PORT = '3000',
  WRITE_INTO_FILE = NEED_TO_WRITE_INTO_FILE.NO,
  KEY_FILE_NAME = 'key.dat',
  KEY_PASSWORD,
  CERTIFICATE_FILE_NAME = 'certificate.cer',
  SIGNED_DATA_FILE_NAME = 'signedData.p7s',
  PARSED_DATA_FILE_NAME = 'decrypted.txt'
} = process.env;

if (!NODE_ENV || ![DEV, PROD].includes(NODE_ENV)) {
  process.env.NODE_ENV = PROD;
}

process.env.DEBUG = DEBUG;

module.exports = {
  isDevelopment: NODE_ENV === DEV,
  server: {
    host: '0.0.0.0',
    port: PORT
  },
  middlewares: {
    rateLimit: {  // https://www.npmjs.com/package/rate-limiter-flexible
      points: 10,
      duration: 1,  // seconds
      blockDuration: 60 * 60 * 24  // seconds
    },
    bodyParser: {  // https://www.npmjs.com/package/body-parser
      text: {
        limit: '256kb'
      }
    },
    corsConfigs: {  // https://www.npmjs.com/package/cors
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
