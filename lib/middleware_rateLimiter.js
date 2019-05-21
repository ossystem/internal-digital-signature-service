const {RateLimiterMemory} = require('rate-limiter-flexible');
const opts = require('../configs').middlewares.rateLimit;

const rateLimiter = new RateLimiterMemory(opts);

module.exports = (req, res, next) => {
  rateLimiter
    .consume(req.connection.remoteAddress, 1)
    .then(() => next())
    .catch(() => next({status: 429}));
};
