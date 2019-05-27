const log = require('./log');

const applyTo = (server, pid) => {
  if (!server || !pid) {
    log.error(__line, __filename, `Process errors handlers haven't been started`);
    return;
  }

  process
    .on('SIGINT', () => {
      log.info(__line, __filename, `Process ${pid} stopped manually`);
      server.close(() => {
        process.exit(0);
      });
    })
    .on('SIGTERM', () => {
      log.info(__line, __filename, `Process ${pid} stopped`);
      server.close(() => {
        process.exit(0);
      });
    })
    .on('unhandledRejection', reason => {
      log.critical(__line, __filename, `Unhandled rejection: ${reason}. Pid: ${pid}`);
      process.exit(1);
    })
    .on('uncaughtException', err => {
      log.critical(__line, __filename, `Uncaught exception: ${err}. Pid: ${pid}`);
      process.exit(1);
    });
};

module.exports = {
  applyTo
};
