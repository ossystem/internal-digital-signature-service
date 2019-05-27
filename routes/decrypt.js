const fs = require('fs');
const path = require('path');
const encoding = require('encoding');
const getUnwrapped = require('../lib/operational/getUnwrapped');
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
      console.error('Invalid request body');
      return next({
        status: 400
      });
    }

    let content = '';
    let isWin = false;
    let isErr = false;
    let data = Buffer.from(stringifiedBody);
    const textInfo = getUnwrapped(data);
    const rpipe = textInfo.pipe || [];

    for (let step of rpipe) {
      const {cert} = step;
      const tr = step.transport ? step.headers : {};

      if (step.error) {
        isErr = true;
        console.error('Error occurred during unwrap:', step.error);
        return;
      }

      if (tr.ENCODING === 'WIN') {
        isWin = true;
        Object.keys(tr).forEach(key => {
          tr[key] = encoding.convert(tr[key], 'utf8', 'cp1251').toString();
        });
      }

      if (tr.SUBJECT) {
        console.error('Subject:', tr.SUBJECT);
      }

      if (tr.FILENAME) {
        console.error('Filename:', tr.FILENAME);
      }

      if (tr.EDRPOU) {
        console.error('Sent-By-EDRPOU:', tr.EDRPOU);
      }

      if (step.signed) {
        console.error('Signed-By:', cert.subject.commonName || cert.subject.organizationName);

        if (cert.extension.ipn && cert.extension.ipn.EDRPOU) {
          console.error('Signed-By-EDRPOU:', cert.extension.ipn.EDRPOU);
        }
      }

      if (step.enc) {
        console.error('Encrypted');
      }
    }

    let result = {
      success: false
    };

    if (!isErr) {
      content = textInfo.content;
      content = isWin ? encoding.convert(content, 'utf-8', 'cp1251') : content;

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
