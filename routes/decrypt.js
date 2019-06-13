const fs = require('fs');
const path = require('path');
const encoding = require('encoding');
const getUnwrapped = require('../lib/operational/getUnwrapped');
const processUnwrapped = require('../lib/operational/processUnwrapped');
const log = require('../lib/log');
const {
  signingSettings: {
    writeIntoFile,
    parsedDataFileName
  }
} = require('../configs');

module.exports = app => {
  app.post('/decrypt', async (req, res, next) => {
    const body = req.body || '';
    let stringifiedBody;
    const resourcesFolder = path.resolve(__dirname, '..', 'resources');

    try {
      stringifiedBody = Buffer.from(body, 'base64');
    } catch (ex) {
      log.exception(__line, __filename, 'Invalid request body');
      return next({
        status: 400
      });
    }

    let content = '';
    let data = Buffer.from(stringifiedBody);
    const textInfo = getUnwrapped(data);
    const {isErr, isWin} = processUnwrapped(textInfo.pipe || []);
    let result = {
      success: false
    };

    if (!isErr) {
      content = textInfo.content;
      content = encoding.convert(content, 'utf-8', 'windows-1251');

      if (writeIntoFile) {
        fs.writeFileSync(path.join(resourcesFolder, parsedDataFileName), content);
      }

      Object.assign(result, {
        success: true,
        data: content.toString('base64')
      });
    }

    return res.json(result);
  });
};
