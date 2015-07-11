'use strict';

var FDSlicer = require('fd-slicer'),
  streamBuffers = require('stream-buffers'),
  // Stream = require('stream'),
  xrate = require('../src/xrate');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/


exports.xrate = {
  develFilesOk: [
  ],
  setUp: function(done) {
    // start xrate
    done();
  },
  tearDown: function(done) {
    // probably dont want to do anything for this,


    xrate.stop(function() {
      done();
    });
  },
  doInitCheck: function(test) {
    // setup for the test
    var increment = 60;
    var starting = 300;

    // to overwrite how much data read pulls in,
    // Stream.Readable.read = function() {
    //   starting += increment;
    //   return starting;
    // };
    var sb = new streamBuffers.ReadableStreamBuffer({
      frequency: 1000,
      chunkSize: 32
    });

    FDSlicer.createReadStream = function() {
      starting += increment;
      console.log(starting + ' create rs');
      sb.put(starting, 'utf8');
      return sb;
    };
    test.expect(1);
    xrate.start(null, FDSlicer);

    setTimeout(function() {
      xrate.status(function(report) {
        console.log('\n');
        console.log(report.i.first);
        console.log(report.i.total);
        console.log(report.i.average);
      });

      test.ok(true, 'true');
      test.done();
    }, 6600);
  }
  // doReadCheck: function(test) {
  // },
  // doCloseCheck: function(test) {
  // }
};

