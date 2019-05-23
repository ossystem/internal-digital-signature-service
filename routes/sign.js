const fs = require('fs');
const path = require('path');
const gost89 = require('gost89');
const {Message} = require('jkurwa/lib/models');
const getStamp = require('../lib/getStamp');
const getCertAndPriv = require('../lib/getCertAndPriv');
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
    const body = req.body || {};
    let stringifiedBody;

    try {
      stringifiedBody = new String(body).valueOf();
    } catch (ex) {
      console.error('Invalid request body');
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
      console.error(`Key file exists: ${keyFileExists}`);
      console.error(`Password exists: ${!!keyPassword}`);
      console.error(`Certificate file exists: ${certificateFileExists}`);
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
      console.error(`Certificate and/or private key weren't processed correct`);
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
      console.error(ex.message || ex);
    } finally {
      if (!msg) {
        console.error(`Signed message wasn't created`);
        return next({
          status: 500
        });
      }
    }

    let signedData;

    try {
      const fileContent = msg.as_asn1();
      signedData = fileContent.toString('base64');

      if (writeIntoFile) {
        fs.writeFileSync(path.join(resourcesFolder, signedDataFileName), fileContent);
      }
    } catch (ex) {
      console.error(ex.message || ex);
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
