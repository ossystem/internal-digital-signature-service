const rfc3161 = require('jkurwa/lib/spec/rfc3161-tsp');
const dstszi2010 = require('jkurwa/lib/spec/dstszi2010');
const httpRequest = require('./httpRequest');

module.exports = async (cert, hashedMessage) => {
  const tsp = rfc3161.TimeStampReq.encode({
    version: 1,
    messageImprint: {
      hashAlgorithm: {
        algorithm: 'Gost34311'
      },
      hashedMessage: hashedMessage
    }
  }, 'der');

  let res;
  const url = cert.extension.tsp;

  try {
    res = await httpRequest({
      url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/tsp-request',
        'Content-Length': tsp.length
      },
      data: tsp
    });
  } catch (ex) {
    console.error(ex.message || ex);
    return null;
  }

  if (!res) {
    console.error(`Response from "${url}" is empty`);
    return null;
  }

  const rtsp = rfc3161.TimeStampResp.decode(res, 'der');

  if (rtsp && rtsp.status && (rtsp.status.status !== 'granted')) {
    console.error(`Decoded data is wrong:`, rtsp);
    return null;
  }

  return dstszi2010.ContentInfo.encode(rtsp.timeStampToken, 'der');
};
