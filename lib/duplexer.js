var util = require('./util');
var Stream = require('readable-stream');

var slice = Array.prototype.slice;
var writeMethods = ['write', 'end', 'destroy'];
var readMethods = ['resume', 'pause'];
var readEvents = ['data', 'close'];

function duplexer(writer, reader) {
  var ended = false;
  var stream = new Stream();

  writeMethods.forEach(proxyWriter);
  readMethods.forEach(proxyReader);
  readEvents.forEach(proxyStream);

  writer.on('drain', function() {
    stream.emit('drain');
  });
  writer.on('error', reemit);

  reader.on('error', reemit);
  reader.on('end', handleEnd);

  stream.writable = writer.writable;
  stream.readable = reader.readable;

  function proxyWriter(methodName) {
    stream[methodName] = method;

    function method() {
      return util.apply(writer[methodName], writer, arguments);
    }
  }

  function proxyReader(methodName) {
    stream[methodName] = method;

    function method() {
      stream.emit(methodName);

      var fn = reader[methodName];

      if (fn) {
        return util.apply(fn, reader, arguments)
      }

      reader.emit(methodName);
    }
  }

  function proxyStream(methodName) {
    reader.on(methodName, reemit);

    function reemit() {
      var args = slice.call(arguments);

      args.unshift(methodName);
      util.apply(stream.emit, stream, args);
    }
  }

  function handleEnd() {
    if (ended) {
      return;
    }

    ended = true;
    var args = slice.call(arguments);

    args.unshift('end');
    util.apply(stream.emit, stream, args);
  }

  function reemit(error) {
    stream.emit('error', error);
  }

  return stream;
}

module.exports = duplexer;
