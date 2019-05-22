const http = require('http');
const url = require('url');

module.exports = (method, toUrl, headers, payload) => new Promise((resolve, reject) => {
  const parsed = url.parse(toUrl);
  const req = http.request({
    host:  parsed.host,
    path: parsed.path,
    headers: headers,
    method: method,
  }, res => {
    const chunks = [];

    res.on('data', chunk => {
      chunks.push(chunk);
    });

    res.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });

  req.on('error', () => {
    reject(null);
  });

  req.write(payload);
  req.end();
});
