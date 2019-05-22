const fs = require('fs');
const path = require('path');
const gost89 = require('gost89');
const jksreader = require('jksreader');
const {Priv, Certificate, Message} = require('jkurwa/lib/models');
const rfc3161 = require('jkurwa/lib/spec/rfc3161-tsp');
const dstszi2010 = require('jkurwa/lib/spec/dstszi2010');
const {keyPassword} = require('../configs');
const httpRequest = require('../lib/httpRequest');

var loadJks = (ret, store, password) => {
  if (!password) {
    throw new Error('JKS file format requires password to be opened');
  }
  var idx, jidx;
  for(idx=0; idx < store.material.length; idx++) {
    var part = store.material[idx];
    var buf = jksreader.decode(part.key, password);
    if (!buf) {
      throw new Error('Cant load key from store, check password');
    }
    var rawStore = Priv.from_asn1(buf, true);
    for(jidx=0; jidx < part.certs.length; jidx++) {
      ret({cert: Certificate.from_pem(part.certs[jidx])});
    }
    for(jidx=0; jidx < rawStore.keys.length; jidx++) {
      ret({priv: rawStore.keys[jidx]});
    }
  }
};

var load = (ret, algo, keyinfo) => {
  if ((keyinfo.priv && keyinfo.priv.type  === 'Priv') ||
    (keyinfo.cert && keyinfo.cert.format === 'x509')) {
    ret({priv: keyinfo.priv});
    ret({cert: keyinfo.cert});
    return;
  }

  var paths;
  if (typeof keyinfo.privPath === 'string') {
    paths = [keyinfo.privPath];
  } else {
    paths = keyinfo.privPath;
  }
  paths.forEach(function (keyPath) {
    var buf = fs.readFileSync(keyPath);

    if (buf[0] === 0x51) {
      buf = buf.slice(6);
    }

    var store = jksreader.parse(buf);

    if (store) {
      loadJks(ret, store, keyinfo.password);
      return;
    }
    try {
      store = Priv.from_protected(buf, keyinfo.password, algo);
    } catch (ignore) {
      throw new Error('Cant load key from store');
    }
    for (idx=0; idx < store.keys.length; idx++) {
      ret({priv: store.keys[idx]});
    }
  });

  if (typeof keyinfo.certPath === 'string') {
    paths = [keyinfo.certPath];
  } else {
    paths = keyinfo.certPath || [];
  }
  var certs = paths.map(function (path) {
    var cbuf = fs.readFileSync(path);
    return Certificate.from_pem(cbuf);
  });
  var idx;
  for (idx=0; idx < certs.length; idx++) {
    ret({cert: certs[idx]});
  }

};

const getStamp = async (cert, hashedMessage) => {
  var tsp = rfc3161.TimeStampReq.encode({
    version: 1,
    messageImprint: {
      hashAlgorithm: {
        algorithm: 'Gost34311',
      },
      hashedMessage: hashedMessage,
    },
  }, 'der');

  let res;

  try {
    res = await httpRequest(
      'POST',
      cert.extension.tsp,
      {
        'Content-Type': 'application/tsp-request',
        'Content-Length': tsp.length,
      },
      tsp,
    );
  } catch (ex) {
    return null;
  }

  if (!res) {
    return null;
  }

  const rtsp = rfc3161.TimeStampResp.decode(res, 'der');

  if (rtsp && rtsp.status && (rtsp.status.status !== 'granted')) {
    return null;
  }

  return dstszi2010.ContentInfo.encode(rtsp.timeStampToken, 'der')
};

module.exports = app => {
  app.post('/sign', async (req, res, next) => {
    const body = req.body || {};
    let jsonBody;

    try {
      jsonBody = JSON.stringify(body);
    } catch (ex) {
      console.error('Invalid request body. Should be JSON');
      return next({
        status: 400
      })
    }

    const resourcesFolder = path.resolve(__dirname, '..', 'resources');
    const keyPath = path.join(resourcesFolder, 'key.dat');
    const certificatePath = path.join(resourcesFolder, 'certificate.cer');
    const keyFileExists = fs.existsSync(keyPath);
    const certificateFileExists = fs.existsSync(certificatePath);

    if (!keyFileExists || !keyPassword || !certificateFileExists) {
        console.error(`Key file exists: ${keyFileExists}`);
        console.error(`Password exists: ${!!keyPassword}`);
        console.error(`Certificate file exists: ${certificateFileExists}`);
        return next({
          status: 500
        });
    }

    const algo = gost89.compat.algos();
    const thisPubIdx = {};

    const add = ({cert, priv}) => {
      if (!cert && !priv) {
        return null;
      }
      const pub = cert ? cert.pubkey : priv.pub();
      const idx = pub.point.toString();
      let container = thisPubIdx[idx] || {};
      container.priv = container.priv || priv;
      container.cert = container.cert || cert;
      thisPubIdx[idx] = container;
    };

    [
      {
        privPath: keyPath,
        password: keyPassword,
        certPath: certificatePath
      }
    ].forEach(load.bind(null, add.bind(this), algo));

    const [{cert, priv}] = Object
      .values(thisPubIdx)
      .filter(ob => ob.cert && ob.priv);

    const data = Buffer.from(jsonBody);
    const dataHash = algo.hash(data);
    const tspB = await getStamp(cert, dataHash);

    const msg = new Message({
      type: 'signedData',
      cert,
      data,
      dataHash,
      signer: priv,
      hash: algo.hash,
      tspB,
      signTime: null,
    });

    const fileContent = msg.as_asn1();

    fs.writeFileSync(path.join(resourcesFolder, 'signedData.p7s'), fileContent);

    return res.json({
      success: true,
      data: fileContent.toString('base64')
    })
  });
};
