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

// Add special global keyword for some flexible debug
Object.defineProperty(global, '__stack', {
  get: function () {
    const orig = Error.prepareStackTrace;
    Error.prepareStackTrace = (_, stack) => stack;
    const err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    const stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  }
});

Object.defineProperty(global, '__line', {
  get: () => __stack[1].getLineNumber()
});

Object.defineProperty(global, '__function', {
  get: () => __stack[1].getFunctionName()
});
