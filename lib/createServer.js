const https = require('https');
const http = require('http');
const {PROTOCOL} = require('./constants');
let {
  server: {protocol, host, port, sslPort}
} = require('../configs');
const pid = process.pid;

module.exports = app => {
  let server;

  // For HTTPS protocol there are 2 servers will run: with HTTP and HTTPS protocol
  if (protocol === PROTOCOL.HTTPS) {
    const options = {
      key: fs.readFileSync('./key.pem'),
      cert: fs.readFileSync('./cert.pem')
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
        console.log(`Additionally starter server using HTTP protocol`);
      });

    server = https.createServer(options, app);
    port = sslPort;
  } else {
    server = http.createServer(app);
  }

  // Adding signals' handlers for run server instance
  server
    .on('error', err => {
      console.error(err);

      if (err.code === 'EADDRINUSE') {
        console.log('Address in use, retrying...');

        setTimeout(() => {
          server.close();
          server.listen(port, host);
        }, 1000);
      } else {
        process.exit(1);
      }
    })
    .on('listening', () => {
      console.log(`Server has been started. Pid: ${pid}`);
      console.log(`Application is available on ${protocol}://${host}:${port}`);
    });

  server.listen(port, host);

  // Returning server instance for using with process errors' handlers
  return server;
};
