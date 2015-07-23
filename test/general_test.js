'use strict';

var streamBuffers = require('stream-buffers'),
  fds = require('fd-slicer'),
  fs = require('fs'),
  xrate = require('../coverage/instrument/src/xrate');

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
var _open = fs.open;

var increment = 0,
  starting = 0;


exports.xrate = {
  develFilesOk: [
  ],
  setUp: function(done) {
    // start xrate
    done();
  },
  tearDown: function(done) {
    xrate.stop(function() {
      fds.createFromFd = _createFromFd;
      fs.open = _open;
      done();
    });
  },
  // doInitCheck: function(test) {
  //   // setup for the test
  //   console.log('\nInit Check');
  //   xrate.once('error', function(err) {
  //     console.log(err);
  //     test.notEqual(err, 'what i thought', 'cou')
  //     test.done();
  //   });

  //   xrate.once('update', function(report) )
  // },
  statusCheck: function(test) {
    console.log('\nStatus Check');
    increment = 60;
    starting = 300;

    fs.open = function(x, y, callback) {
      // dont need to give anything useful back;
      callback(null, null);
    };

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

    test.expect(4);
    xrate.start();

    setTimeout(function() {
      xrate.status(function(report) {
        test.ok(report.o.first === (increment * 2), 'should be recording in that increment');
        test.ok(report.i.first === (increment * 2), 'should be recording in that increment');
        test.ok(report.o.average === (increment * 2), 'average should be 2 times increment');
        test.ok(report.i.average === (increment * 2), 'average should be 2 times increment');
      });
      test.done();
    }, 5000);
  },
  updateCheck: function(test) {
    console.log('Update Check');
    increment = 100;
    starting = 10000;

    fs.open = function(x, y, callback) {
      // dont need to give anything useful back;
      callback(null, null);
    };

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
      xrate.once('update', function(last) {
        test.ok(last.o === 200, 'right increment');
        test.ok(last.i === 200, 'right increment');
        test.done();
      });
    }, 3000);
  },
  doStopCheck: function(test) {
    console.log('Stop Check');
    increment = 100;
    starting = 10000;
    fs.open = function(x, y, callback) {
      // dont need to give anything useful back;
      callback(null, null);
    };
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
      xrate.stop(function(last) {
        test.ok(last.o.total === 200, 'how much bandwidth had passed in this amount of time');
        test.ok(last.i.total === 200, 'how much bandwidth had passed in this amount of time');
        test.done();
      });
    }, 6000);
  },
  doErrorCheck: function(test) {
    console.log('Error Check');

    test.expect(1);
    var errorSettings = {
      base: '/should/not/work/',
      device: 'eth0',
      sent: 'statistics/rx_bytes',
      rcvd: 'statistics/tx_bytes'
    };
    xrate.settings(errorSettings);
    xrate.start();

    xrate.once('error', function(message) {
      test.ok(message === 'could not find bandwidth data', 'right error message');
      test.done();
    });
  }
};

