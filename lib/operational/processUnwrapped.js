const log = require('../log');

module.exports = (rpipe = []) => {
  const result = {
    isErr: true,
    isWin: false
  };

  for (let step of rpipe) {
    const {cert} = step;
    const tr = step.transport ? step.headers : {};

    if (step.error) {
      log.error(__line, __filename, `Error occurred during unwrap: ${step.error}`);
      return result;
    }

    if (tr.ENCODING === 'WIN') {
      result.isWin = true;

      Object.keys(tr).forEach(key => {
        tr[key] = encoding.convert(tr[key], 'utf8', 'cp1251').toString();
      });
    }

    log.info(__line, __filename, `tr: ${tr}`);
    log.info(__line, __filename, `cert.subject: ${cert.subject}`);
    log.info(__line, __filename, `cert.extension.ipn: ${cert.extension.ipn}`);
  }

  return Object.assign(result, {
    isErr: false
  });
};
