'use strict';

var xrate = require('../src/xrate');

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
    // console.log('\nsetUp');
    done();
  },
  tearDown: function(done) {
    // probably dont want to do anything for this,
    done();
  },
  doStartCheck: function(test) {
    xrate.doStartCheck(function(passed) {
      test.expect(1);
      test.ok(passed, 'up and running!');
      console.log('start');
      test.done();
    });
  },
  doInitCheck: function(test) {
    xrate.doInitCheck(function(passed) {
      test.expect(1);
      test.ok(passed.pathExists, 'file we need is where is supposed to be');
      console.log('init');
      test.done();
    });
  },
  doReadCheck: function(test) {
    xrate.doReadCheck(function(passed) {
      console.log('read');
      test.expect(2);
      test.ok(passed.update, 'reader is updating the last report');
      test.ok(passed.update, 'reader is updating the history');
      test.done();
    });
  },
  doCloseCheck: function(test) {
    xrate.doCloseCheck(function(passed) {
      test.expect(2);
      test.ok(passed.stopped, 'service stopped');
      test.ok(passed.history, 'reader is updating the history');
      console.log('close');
      test.done();
    });
  }
};

