/**
 * @license XRate
 * Copyright (c) 2014 Accretive Technology Group, Inc.  http://accretivetg.com
 * MIT Licensed  https://github.com/accretive/xrate/blob/master/LICENSE
 *
 * @file xrate.js - tracks bandwidth on linux servers
 *
 */
'use strict';

var async = require('async'),
  fs = require('fs'),
  path = require('path'),
  os = require('os'),
  util = require('util'),
  emitter = require('events').EventEmitter,
  fdSlicer = require('fd-slicer');
// ===================================

var settings = {
      base: '/sys/class/net',
      device: 'eth0',
      sent: 'statistics/rx_bytes',
      rcvd: 'statistics/tx_bytes'
    },
// default config settings
    config = {
      frequency: 1000,
      units: 'bytes',
      update: true
    },
    job = null,
    secondIndex = 0,
    tempLog = [], // keeps track of up records from the last minute,
    seconds = 60,
    lastReport = {
      i: {
      total: 0,
      first: 0,
      average: 0
      },
      o: {
        total: 0,
        first: 0,
        average: 0
      }
    },
    self,
    history = {
      i: {
        total: 0
      },
      o: {
        total: 0
      }
  },
  fd = [],
  outSlice = null,
  inSlice = null;


// give xrate emitting capabilities
util.inherits(XRate, emitter);
// pass this off somewhere!
module.exports = new XRate();

/*
* constructor with optional settings, if none are specified, it uses default settings
*/
function XRate() {
  emitter.call(this);
  self = this;
}

/*
* helper for update to break things up a little
*/
var avg = function(callback) {
  var o = 0,
  i = 0;
  tempLog[secondIndex++ % seconds] = [lastReport.o.first, lastReport.i.first];
  for (var j = 0; j < tempLog.length; j++) {
    o += tempLog[j][0];
    i += tempLog[j][1];
  }

  lastReport.o.average = o / tempLog.length;
  lastReport.i.average = i / tempLog.length;
  callback();
};

/*
* reads incoming and outgoing bandwidth information and then processes it
* into ~lastReport~ which gives information about bandwidth usage in the last
* second.
*/
var reader = function(callback) {
  var oStream = outSlice.createReadStream();
  var iStream = inSlice.createReadStream();

  oStream.on('readable', function() {
    var chunk = oStream.read().toString().split(os.EOL)[0];
    if (lastReport.o.total === 0) {
      lastReport.o.total = chunk;
    } else {
      lastReport.o.first = chunk - lastReport.o.total;
      history.o.total += lastReport.o.first;
      lastReport.o.total = chunk;
    }
  });

  iStream.on('readable', function() {
    var chunk = iStream.read().toString().split(os.EOL)[0];

    if (lastReport.i.total === 0) {
      lastReport.i.total = chunk;
    } else {
      lastReport.i.first = chunk - lastReport.i.total;
      history.i.total += lastReport.i.first;
      lastReport.i.total = chunk;
    }
  });

  avg(function() {
    callback();
  });
};

XRate.prototype.start = function(opConfig) {
  if (opConfig) {
    config = opConfig;
  }

  var syspath = path.normalize(settings.base + '/' + settings.device + '/');
  // read the info
  async.series([
    function(callback) {
      fs.open(syspath + settings.sent, 'r', function(err, fd) {
          if (!err) {
            callback(null, fd);
          }
        });
    },
    function(callback) {
      fs.open(syspath + settings.rcvd, 'r', function(err, fd) {
        if (!err) {
          callback(null, fd);
        }
      });
    }
  ],
  // optional callback
  function(err, fdz) {
    if (!err) {
      fd = fdz;
      outSlice = fdSlicer.createFromFd(fd[0]);
      inSlice = fdSlicer.createFromFd(fd[1]);

      job = setInterval(function() {
        reader(function() {
          // issue event!
          if (config.update) {
            self.emit('update', lastReport);
          }
        });
      }, config.frequency);
    }
  });
};

/*
* makes xrate stop reporting
*/
XRate.prototype.stop = function(callback) {
  clearInterval(job);
  callback(history);
};

/*
* reports the most recent ~lastReport~
*/
XRate.prototype.status = function(callback) {
  callback(lastReport);
};


/*
* unit tests
*/

// XRate.prototype.doStartCheck = function(callback) {
//   callback(true);
// };


// XRate.prototype.doInitCheck = function(callback) {
//   var passedTest = {
//     pathExists: false
//   };
//   passedTest.pathExists = true;
//   // callback(passedTest);

//   var syspath = path.normalize(settings.base + '/' + settings.device + '/');

//   async.filter([syspath + settings.sent, syspath + settings.rcvd], fs.exists, function(err, results) {
//     if (err) {
//       callback()
//     }
//     if (results[0] && results[1]) {
//       passedTest.pathExists = true;
//     }

//     callback(passedTest);
//   });
// };


// XRate.prototype.doReadCheck = function(callback) {
//   // first, call read
//   var oldReport = lastReport;
//   reader(function() {
//     var passedTest = {
//       update: false,
//       history: false
//     };

//     // if these things are the same, thats probably a bad sign
//     if (oldReport !== lastReport) {
//       passedTest.update = true;
//     }

//     // bad sign
//     if (history.i.total !== 0 || history.i.total !== 0) {
//       passedTest.history = true;
//     }

//     callback(passedTest);
//   });
// };

// XRate.prototype.doCloseCheck = function(callback) {
//   var passedTest = {
//       stopped: false,
//       history: false
//     };
//   this.stop(function(history) {
//     passedTest.stopped = true;
//     if (history) {
//       passedTest.history = true;
//     }
//     callback(passedTest);
//   });
// };
