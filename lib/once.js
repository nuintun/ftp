var util = require('./util');
var wrappy = require('wrappy');

function once(fn) {
  var cb = function() {
    if (cb.called) return cb.value;

    cb.called = true;

    return cb.value = util.apply(fn, this, arguments);
  }

  cb.called = false;

  return cb;
}

module.exports = wrappy(once);
