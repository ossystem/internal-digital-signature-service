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
const createServer = require('./lib/createServer');
const parseBodyAsText = require('./lib/middleware_parseBodyAsText');
const routes = require('./routes');
const {middlewares: {corsConfigs, bodyParser}} = require('./configs');
const pid = process.pid;
const app = express();

// Applying all required middlewares
app.use(logger('combined'));
app.use(rateLimiter);
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
errorHandlers.applyTo(createServer(app), pid);

// Initializing additional required logic
require('./lib/additionalInit');
