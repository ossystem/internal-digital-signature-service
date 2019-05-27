const {Message} = require('jkurwa/lib/models');
const transport = require('jkurwa/lib/util/transport');
const gost89 = require('gost89');

module.exports = data => {
  let msg;
  let content = '';
  let tr;
  const algo = gost89.compat.algos();
  const info = {
    pipe: []
  };

  while (data && data.length) {
    try {
      tr = transport.decode(data);
    } catch (ex) {
      console.log(ex.message || ex);
      tr = null;
    }

    if (tr) {
      if (tr.header) {
        info.pipe.push({
          transport: true,
          headers: tr.header
        });
      }

      msg = tr.docs.shift();

      while (msg.type === 'CERTCRYPT') {
        msg = tr.docs.shift();
      }

      if ((msg.type.substr(3) === '_CRYPT') || (msg.type.substr(3) === '_SIGN')) {
        data = msg.contents;
      }

      if ((msg.type.substr(0, 3)) === 'QLB' && (tr.docs.length > 0)) {
        content = tr.docs.shift().contents;
      }

      if ((msg.type === 'DOCUMENT') && (msg.encoding === 'PACKED_XML_DOCUMENT')) {
        data = msg.contents;
        continue;
      }
    }

    try {
      msg = new Message(data);
    } catch (ex) {
      console.log(ex.message || ex);
      if (tr === null) {
        break;
      }
    }

    if (msg.type === 'signedData') {
      if (msg.info.contentInfo.content === undefined) {
        if (content === undefined) {
          info.pipe.push({
            error: 'ENODATA'
          });
          break;
        }

        msg.info.contentInfo.content = content;
      }

      const signed = msg.verify(algo.hash);

      if (signed !== true) {
        info.pipe.push({
          broken_sign: true,
          error: 'ESIGN'
        });
        break;
      }

      const x = msg.signer();
      data = msg.info.contentInfo.content;

      info.pipe.push({
        signed,
        cert: {
          subject: x.subject,
          issuer: x.issuer,
          extension: x.extension,
          valid: x.valid
        },
        signingTime: msg.pattrs.signingTime
      });
    }
  }

  info.content = data;

  if (info.pipe.length && info.pipe[info.pipe.length - 1].error) {
    info.error = info.pipe[info.pipe.length - 1].error;
  }

  return info;
};
