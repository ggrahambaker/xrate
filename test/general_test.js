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

// var increment = 0,
//   starting = 0;


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
  statusCheck: function(test) {
    console.log('\nStatus Check');
    var increment = 60;
    var starting = 300;

    fs.open = function(x, y, callback) {
      // dont need to give anything useful back;
      callback(null, null);
    };

    function StreamMock() {
      var self = this;

      this.sb = new streamBuffers.ReadableStreamBuffer({
        frequency: 1,
        chunkSize: 32
      });

      this.createReadStream = function() {
        starting += increment;
        self.sb.put(starting, 'utf8');
        return self.sb;
      };
    }

    fds.createFromFd = function() {
      return new StreamMock();
    };

    test.expect(5);
    xrate.start();

    setTimeout(function() {
      xrate.status(function(err, report) {
        test.ok(!err, 'there should be no error here!');
        test.ok(report.o.first === (increment * 2), 'should be recording in that increment');
        test.ok(report.i.first === (increment * 2), 'should be recording in that increment');
        test.ok(report.o.average === (increment * 2), 'average should be 2 times increment');
        test.ok(report.i.average === (increment * 2), 'average should be 2 times increment');
        test.done();
      });
    }, 5000);
  },
  updateCheck: function(test) {
    console.log('Update Check');
    var increment = 100;
    var starting = 10000;

    fs.open = function(x, y, callback) {
      // dont need to give anything useful back;
      callback(null, null);
    };

    function StreamMock() {
      var self = this;
      self.sb = new streamBuffers.ReadableStreamBuffer({
        frequency: 1,
        chunkSize: 32
      });

      this.createReadStream = function() {
        starting += increment;

        self.sb.put(starting, 'utf8');
        return self.sb;
      };
    }
    fds.createFromFd = function() {
      return new StreamMock();
    };

    test.expect(2);
    xrate.start();
    setTimeout(function() {
      xrate.once('update', function(last) {
        test.ok(last.o.first === 200, 'right increment');
        test.ok(last.i.first === 200, 'right increment');
        test.done();
      });
    }, 5000);
  },
  doStopCheck: function(test) {
    console.log('Stop Check');
    var increment = 100;
    var starting = 10000;
    fs.open = function(x, y, callback) {
      // dont need to give anything useful back;
      callback(null, null);
    };

    function StreamMock() {
      var self = this;
      self.sb = new streamBuffers.ReadableStreamBuffer({
        frequency: 1,
        chunkSize: 32
      });

      this.createReadStream = function() {
        starting += increment;

        self.sb.put(starting, 'utf8');
        return self.sb;
      };
    }
    fds.createFromFd = function() {
      return new StreamMock();
    };

    test.expect(3);
    xrate.start();

    setTimeout(function() {
      xrate.stop(function(err, last) {
        test.ok(!err, 'should not be an error here');
        test.ok(last.o.first === 200, 'how much bandwidth had passed in this amount of time');
        test.ok(last.i.first === 200, 'how much bandwidth had passed in this amount of time');
        test.done();
      });
    }, 5000);
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

