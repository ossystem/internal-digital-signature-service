const http = require('http');
const urlModule = require('url');

module.exports = ({url, method, headers, data}) => new Promise((resolve, reject) => {
  const parsed = urlModule.parse(url);
  const req = http.request({
    host: parsed.host,
    path: parsed.path,
    headers: headers,
    method: method
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

  req.write(data);
  req.end();
});
