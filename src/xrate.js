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
  emitter = require('events').EventEmitter;
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
  };

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

  for (var j = 0; j < tempLog.length; j++) {
    o += tempLog[j][0];
    i += tempLog[j][1];
  }

  lastReport.o.average = o / tempLog.length;
  lastReport.i.average = i / tempLog.length;
  callback();
};

/*
* helper to reader to slot pieces into place
*/
var update = function(log, callback) {
  // this means this is our first time through
  if (lastReport.o.total === 0) {
    lastReport.o.total = log[0];
    lastReport.i.total = log[1];
  } else {
    lastReport.o.first = log[0] - lastReport.o.total;
    lastReport.i.first = log[1] - lastReport.i.total;
    // pass this to history,

    history.o.total += lastReport.o.first;
    history.i.total += lastReport.i.first;

    lastReport.o.total = log[0];
    lastReport.i.total = log[1];

    // calc average
    tempLog[secondIndex++ % seconds] = [lastReport.o.first, lastReport.i.first];
    avg(function() {
      callback();
    });
  }
};

/*
* reads incoming and outgoing bandwidth information and then processes it
* into ~lastReport~ which gives information about bandwidth usage in the last
* second.
*/
var reader = function(callback) {
  var syspath = path.normalize(settings.base + '/' + settings.device + '/');

  // read the info
  async.map([syspath + settings.sent, syspath + settings.rcvd], fs.readFile, function(err, results) {
    if (err) {
      this.emit('error', 'error reading file');
    }

    var thisRecord = [];

    for (var i = 0; i < results.length; i++) {
      if (config) {
        thisRecord[i] = results[i].toString().split(os.EOL)[0];
      }
    }
    update(thisRecord, function() {
      callback();
    });
  });
};

XRate.prototype.start = function() {
  if (settings) {
    config = settings;
  }

  job = setInterval(function() {
    reader(function() {
      // issue event!
      if (config.update) {
        self.emit('update', lastReport);
      }
    });
  }, config.frequency);
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
