const applyTo = (server, pid) => {
  if (!server || !pid) {
    console.error(`Errors' handlers haven't been started`);
    return;
  }

  process
    .on('SIGINT', () => {
      console.log(`Process ${pid} stopped manually`);
      server.close(() => {
        process.exit(0);
      });
    })
    .on('SIGTERM', () => {
      console.log(`Process ${pid} stopped`);
      server.close(() => {
        process.exit(0);
      });
    })
    .on('unhandledRejection', reason => {
      console.error(`Unhandled rejection: ${reason}. Pid: ${pid}`);
      process.exit(1);
    })
    .on('uncaughtException', err => {
      console.error(`Uncaught exception: ${err}. Pid: ${pid}`);
      process.exit(1);
    });
};

module.exports = {
  applyTo
};
