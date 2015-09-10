'use strict';

var streamBuffers = require('stream-buffers'),
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

var _createReadStream = fs.createReadStream;
var _open = fs.open;

var config = {
    frequency: 1000, // how often statistics are reported
    units: 'B' // B, KB, MB, GB, TB, PB
};
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
      fs.createReadStream = _createReadStream;
      fs.open = _open;
      done();
    });
  },
  statusCheck: function(test) {
    console.log('\nStatus Check');
    var increment = 60;
    var starting = 300;

    fs.createReadStream = function() {
      var sm = new streamBuffers.ReadableStreamBuffer({
        frequency: 1,
        chunkSize: 32
      });
      starting += increment;
      sm.put(starting, 'utf8');
      return sm;
    };

    test.expect(4);
    xrate.start(config);

    setTimeout(function() {
      xrate.update(function(report) {
        test.ok(report.o.first === 120, 'should be recording in that increment');
        test.ok(report.i.first === 120, 'should be recording in that increment');
        test.ok(report.o.total === 360, 'total should be 2 times increment');
        test.ok(report.i.total === 360, 'total should be 2 times increment');
        test.done();
      });
    }, 5000);
  },
  updateCheck: function(test) {
    console.log('Update Check');
    var increment = 60;
    var starting = 300;

    fs.createReadStream = function() {
      var sm = new streamBuffers.ReadableStreamBuffer({
        frequency: 1,
        chunkSize: 32
      });
      starting += increment;
      sm.put(starting, 'utf8');
      return sm;
    };

    test.expect(4);
    xrate.start(config);
    setTimeout(function() {
      xrate.once('update', function(last) {
        // should be the same as before,
        // just trying a different way of getting it
        test.ok(last.o.first === 120, 'right increment');
        test.ok(last.i.first === 120, 'right increment');
        test.ok(last.o.total === 360, 'total should be 2 times increment');
        test.ok(last.i.total === 360, 'total should be 2 times increment');
        test.done();
      });
    }, 5000);
  },
  doStopCheck: function(test) {
    console.log('Stop Check');
    var increment = 60;
    var starting = 300;

    fs.createReadStream = function() {
      var sm = new streamBuffers.ReadableStreamBuffer({
        frequency: 1,
        chunkSize: 32
      });
      starting += increment;
      sm.put(starting, 'utf8');
      return sm;
    };

    test.expect(2);
    xrate.start(config);

    setTimeout(function() {
      xrate.stop(function(last) {
        test.ok(last.o.first === 120, 'how much bandwidth had passed in this amount of time');
        test.ok(last.i.first === 120, 'how much bandwidth had passed in this amount of time');
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

    xrate.start(config);

    xrate.once('error', function(message) {
      test.ok(message.code === 'ENOENT', 'right error message');
      test.done();
    });
  }
};

