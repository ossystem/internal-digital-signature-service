const fs = require('fs');
const {Priv, Certificate} = require('jkurwa/lib/models');

const add = ({pubIdx, cert, priv}) => {
  if (!cert && !priv) {
    return {};
  }

  const pub = cert ? cert.pubkey : priv.pub();
  const idx = pub.point.toString();
  let container = pubIdx[idx] || {};
  container.priv = container.priv || priv;
  container.cert = container.cert || cert;
  pubIdx[idx] = container;

  return pubIdx;
};

module.exports = (keyPath, keyPassword, certificatePath, algo) => {
  let pubIdx = {};
  let keyFileBuffer;
  let certificateBuffer;
  const result = {
    cert: null,
    priv: null
  };

  try {
    keyFileBuffer = fs.readFileSync(keyPath);
  } catch (ex) {
    console.error(ex.message || ex);
    return result;
  }

  if (keyFileBuffer[0] === 0x51) {
    keyFileBuffer = keyFileBuffer.slice(6);
  }

  let store;

  try {
    store = Priv.from_protected(keyFileBuffer, keyPassword, algo);
  } catch (ex) {
    console.error(ex.message || ex);
    return result;
  }

  for (let key of store.keys) {
    pubIdx = add({
      pubIdx,
      priv: key
    });
  }

  try {
    certificateBuffer = fs.readFileSync(certificatePath);
  } catch (ex) {
    console.error(ex.message || ex);
    return result;
  }

  pubIdx = add({
    pubIdx,
    cert: Certificate.from_pem(certificateBuffer)
  });

  const [{cert, priv}] = Object
    .values(pubIdx)
    .filter(ob => ob.cert && ob.priv);

  return {
    cert,
    priv
  };
};
