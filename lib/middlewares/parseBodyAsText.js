module.exports = (req, res, next) => {
  let chunk = '';
  let buffers = [];

  req.on('data', data => {
    buffers.push(data);
    chunk += data;
  });

  req.on('end', () => {
    req.body = chunk;
    req.bodyBuffer = Buffer.concat(buffers);
    next();
  });
};
