const fs = require('fs');
const path = require('path');
const gost89 = require('gost89');
const {Message} = require('jkurwa/lib/models');
const getStamp = require('../lib/operational/getStamp');
const getCertAndPriv = require('../lib/operational/getCertAndPriv');
const log = require('../lib/log');
const {
  signingSettings: {
    writeIntoFile,
    keyFileName,
    keyPassword,
    certificateFileName,
    signedDataFileName
  }
} = require('../configs');

module.exports = app => {
  app.post('/sign', async (req, res, next) => {
    const body = req.body || '';
    let stringifiedBody;

    try {
      stringifiedBody = new String(body).valueOf();
    } catch (ex) {
      log.exception(__line, __filename, 'Invalid request body');
      return next({
        status: 400
      });
    }

    const resourcesFolder = path.resolve(__dirname, '..', 'resources');
    const keyPath = path.join(resourcesFolder, keyFileName);
    const certificatePath = path.join(resourcesFolder, certificateFileName);
    const keyFileExists = fs.existsSync(keyPath);
    const certificateFileExists = fs.existsSync(certificatePath);

    // Key and certificate files should be placed in 'resources' folder
    // and KEY_PASSWORD parameter should be set as environment variable
    if (!keyFileExists || !keyPassword || !certificateFileExists) {
      log.error(__line, __filename, `Key file exists: ${keyFileExists}`);
      log.error(__line, __filename, `Password exists: ${!!keyPassword}`);
      log.error(__line, __filename, `Certificate file exists: ${certificateFileExists}`);
      return next({
        status: 500
      });
    }

    const algo = gost89.compat.algos();
    const {cert, priv} = getCertAndPriv(keyPath, keyPassword, certificatePath, algo);
    const data = Buffer.from(stringifiedBody);
    const dataHash = algo.hash(data);
    const tspB = await getStamp(cert, dataHash);

    if (!cert || !priv) {
      log.error(__line, __filename, `Certificate and/or private key weren't processed correct`);
      return next({
        status: 500
      });
    }

    let msg;

    try {
      msg = new Message({
        type: 'signedData',
        cert,
        data,
        dataHash,
        signer: priv,
        hash: algo.hash,
        tspB,
        signTime: null
      });
    } catch (ex) {
      log.exception(__line, __filename, ex.message || ex);
    } finally {
      if (!msg) {
        log.error(__line, __filename, `Signed message wasn't created`);
        return next({
          status: 500
        });
      }
    }

    let signedData;

    try {
      const content = msg.as_asn1();
      signedData = content.toString('base64');

      if (writeIntoFile) {
        fs.writeFileSync(path.join(resourcesFolder, signedDataFileName), content);
      }
    } catch (ex) {
      log.exception(__line, __filename, ex.message || ex);
      return next({
        status: 500
      });
    }

    return res.json({
      success: true,
      data: signedData
    });
  });
};
