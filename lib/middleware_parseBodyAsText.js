module.exports = (req, res, next) => {
  let chunk = '';

  req.on('data', data => chunk += data);

  req.on('end', () => {
    req.body = chunk;
    next();
  });
};
