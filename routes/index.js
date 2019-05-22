const {readdirSync} = require('fs');
const path = require('path');
const {HTTP_ERRORS} = require('../lib/constants');

const applyTo = app => {
  if (!app || (app && (typeof app.use !== 'function'))) {
    console.error(`Routes' handlers haven't been initialized.`);
    return process.exit(1);
  }

  readdirSync(__dirname).forEach(fileName => {
    if (!['index.js', '.', '..'].includes(fileName)) {
      require(path.join(__dirname, fileName))(app);
    }
  });

  app.use((req, res, next) => next({
    status: 404
  }));

  app.use((err, req, res, next) => {
    console.error(err);

    const status = err.status || 500;

    res
      .status(status)
      .json({
        success: false,
        message: HTTP_ERRORS[status]
      });
  });

  return app;
};

module.exports = {
  applyTo
};