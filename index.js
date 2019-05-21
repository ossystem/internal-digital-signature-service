process.env.ROOT = __dirname;
require('dotenv').config();

const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const sanitizer = require('express-sanitizer');
const cookieParser = require('cookie-parser');
const requestId = require('express-request-id');
const rateLimiter = require('./lib/middleware_rateLimiter');
const errorHandlers = require('./lib/errorHandlers');
const routes = require('./routes');
const {PROTOCOL} = require('./lib/constants');
const pid = process.pid;
const {
  isDevelopment,
  server: {protocol, host, port},
  middlewares: {corsConfigs, bodyParser}
} = require('./configs');

const app = express();

// It needs to logging into console only if it's not production mode
if (isDevelopment) {
  app.use(logger('combined'));
}

// Applying all required middlewares
app.use(rateLimiter);
app.use(requestId());
app.use(cors((corsConfigs && corsConfigs.enabled) ? corsConfigs : {}));
app.use(express.json(bodyParser.json));
app.use(express.urlencoded(bodyParser.urlencoded));
app.use(helmet());
app.use(sanitizer());
app.use(cookieParser());
app.set('trust proxy', true);

// Initializing routes for processing business logic
routes.applyTo(app);

// Creating server instance
let protocolModule = PROTOCOL.HTTP;

if (protocol === PROTOCOL.HTTPS) {
  protocolModule = PROTOCOL.HTTPS;

  // TODO: Add certificates
}

const server = require(protocolModule)
  .createServer(app)
  .on('error', err => {
    console.error(err);
    process.exit(1);
  })
  .on('listening', () => {
    console.log(`Server has been started. Pid: ${pid}`);
    console.log(`Application is available on ${protocol}://${host}:${port}`);
  });

// Initializing signals' handlers for run server
errorHandlers.applyTo(server, pid);

// Running server instance
server.listen({host, port});
