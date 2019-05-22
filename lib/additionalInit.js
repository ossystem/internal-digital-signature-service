global.crypto = require('crypto');

// It's requiring for creating hash for signing data
if (typeof global.crypto.getRandomValues !== 'function') {
  global.crypto.getRandomValues = xb => {
    const ret = global.crypto.rng(xb.length);

    for (let i = 0; i < xb.length; i++) {
      xb[i] = ret[i];
    }

    return ret;
  };
}
