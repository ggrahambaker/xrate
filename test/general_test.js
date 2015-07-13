'use strict';

var streamBuffers = require('stream-buffers'),
  fds = require('fd-slicer'),
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

var _createFromFd = fds.createFromFd;

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
      fds.createFromFd = _createFromFd;
    });
  },
  doInitCheck: function(test) {
    // setup for the test
    var increment = 60;
    var starting = 300;

    function StreamMock() {
      var self = this;

      var sb = new streamBuffers.ReadableStreamBuffer({
        frequency: 1000,
        chunkSize: 32
      });

      self.createReadStream = function() {
        starting += increment;
        sb.put(starting, 'utf8');
        return sb;
      };
    }
    fds.createFromFd = function() {
      return new StreamMock();
    };

    test.expect(2);
    xrate.start();

    setTimeout(function() {
      xrate.status(function(report) {
        test.ok(report.i.first === (increment * 2), 'should be recording in that increment');
        test.ok(report.i.average === (increment * 2), 'average should be 2 times increment');
      });
      test.done();
    }, 5000);
  }
  // doReadCheck: function(test) {
  // },
  // doCloseCheck: function(test) {
  // }
};

