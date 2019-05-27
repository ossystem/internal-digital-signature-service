const https = require('https');
const http = require('http');
const path = require('path');
const {PROTOCOL} = require('./constants');
const log = require('./log');
let {
  server: {protocol, host, port, sslPort}
} = require('../configs');
const pid = process.pid;

module.exports = app => {
  let server;

  // For HTTPS protocol there are 2 servers will run: with HTTP and HTTPS protocol
  if (protocol === PROTOCOL.HTTPS) {
    const resourcesFolder = path.resolve(__dirname, '..', 'resources');
    const options = {
      key: fs.readFileSync(path.join(resourcesFolder, 'key.pem')),
      cert: fs.readFileSync(path.join(resourcesFolder, 'cert.pem'))
    };

    app.all('*', (req, res, next) => {
      if (!req.secure) {
        return res.redirect(`https://${host}:${sslPort}`);
      }

      next();
    });

    http
      .createServer(app)
      .listen(port, host, () => {
        log.info(__line, __filename, 'Additionally starter server using HTTP protocol');
      });

    server = https.createServer(options, app);
    port = sslPort;
  } else {
    server = http.createServer(app);
  }

  // Adding signals' handlers for run server instance
  server
    .on('error', err => {
      log.error(__line, __filename, err);

      if (err.code === 'EADDRINUSE') {
        log.warning(__line, __filename, 'Address in use, retrying...');

        setTimeout(() => {
          server.close();
          server.listen(port, host);
        }, 1000);
      } else {
        process.exit(1);
      }
    })
    .on('listening', () => {
      log.info(__line, __filename, `Server has been started. Pid: ${pid}`);
      log.info(__line, __filename, `Application is available on ${protocol}://${host}:${port}`);
    });

  server.listen(port, host);

  // Returning server instance for using with process errors' handlers
  return server;
};
