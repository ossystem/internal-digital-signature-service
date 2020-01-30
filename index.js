process.env.ROOT = __dirname;
require('dotenv').config();

const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const sanitizer = require('express-sanitizer');
const cookieParser = require('cookie-parser');
const requestId = require('express-request-id');
const rateLimiter = require('./lib/middlewares/rateLimiter');
const processHandlers = require('./lib/processHandlers');
const createServer = require('./lib/createServer');
const parseBodyAsText = require('./lib/middlewares/parseBodyAsText');
const routes = require('./routes');
const pid = process.pid;
const app = express();
const {
  middlewares: {
    corsConfigs
  },
} = require('./configs');

app.use(rateLimiter);
app.use(logger('common'));
app.use(requestId());
app.use(cors((corsConfigs && corsConfigs.enabled) ? corsConfigs : {}));
app.use(parseBodyAsText);
app.use(helmet());
app.use(sanitizer());
app.use(cookieParser());
app.set('trust proxy', true);

// Initializing routes for processing business logic
routes.applyTo(app);

// Initializing signals' handlers for run server
processHandlers.applyTo(createServer(app), pid);

// Initializing additional required logic
require('./lib/additionalInit');
