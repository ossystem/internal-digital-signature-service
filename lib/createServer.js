const http = require('http');
const log = require('./log');
const {
  server: {host, port}
} = require('../configs');
const pid = process.pid;

module.exports = app => {
  const server = http.createServer(app);

  // Adding signals' handlers for run server instance
  server
    .on('error', err => {
      log.error(__line, __filename, err);

      if (err.code === 'EADDRINUSE') {
        log.warning(__line, __filename, 'Address in use, retrying...');

        setTimeout(() => {
          server.close();
          server.listen(port, host);
        }, 5000);
      } else {
        process.exit(1);
      }
    })
    .on('listening', () => {
      log.info(__line, __filename, `Server has been started. Pid: ${pid}`);
      log.info(__line, __filename, `Application is available on http://${host}:${port}`);
    });

  server.listen(port, host);

  // Returning server instance for using with process errors' handlers
  return server;
};
