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
  fdSlicer = require('fd-slicer'),
  stats = require('./stats');
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
    // secondIndex = 0,
    // tempLog = [], // keeps track of up records from the last minute,
    // seconds = 60,
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
  // fd = [],
  outSlice = null,
  inSlice = null,
  iStat = null,
  oStat = null;


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

var update = function() {
  var oStream = outSlice.createReadStream();
  var iStream = inSlice.createReadStream();

  oStream.once('data', function(chunk) {
    chunk = chunk.toString().split(os.EOL)[0];
    // console.log(chunk + ' : the o chunk');
    oStat.addEntry(chunk);
  });

  iStream.once('data', function(chunk) {
    chunk = chunk.toString().split(os.EOL)[0];
    // console.log(chunk + ' : the i chunk');
    iStat.addEntry(chunk);
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
          } else {
            callback(err);
          }
        });
    },
    function(callback) {
      fs.open(syspath + settings.rcvd, 'r', function(err, fd) {
        // console.log(err + ' the error 2')
        if (!err) {
          callback(null, fd);
        } else {
          callback(err);
        }
      });
    }
  ],
  function(err, fd) {
    if (!err) {
      outSlice = fdSlicer.createFromFd(fd[0]);
      inSlice = fdSlicer.createFromFd(fd[1]);

      oStat = stats.createStat();
      iStat = stats.createStat();

      job = setInterval(function() {
        update();
        if (config.update) {
          lastReport = {
            i: iStat.first,
            o: oStat.first
          };

          self.emit('update', lastReport);
        }
      }, config.frequency);
    } else {
      self.emit('error', 'could not find bandwidth data');
    }
  });
};

/*
* makes xrate stop reporting
*/
XRate.prototype.stop = function(callback) {
  clearInterval(job);
 // console.log(iStat.last() + ' ><><' +oStat.last());
  var history = {
    i: {
      total: iStat.last()
    },
    o: {
      total: oStat.last()
    }
  };
  callback(history);
};

/*
* reports the most recent ~lastReport~
*/
XRate.prototype.status = function(callback) {
  oStat.report(function(report) {
    iStat.report(function(rep) {
      // console.log(report.average);
      // console.log(rep.average);
      var stat = {
        i: rep,
        o: report
      };
      callback(stat);
    });
  });
};

XRate.prototype.settings = function(newSettings) {
  // console.log('\n' + newSettings.base);
  settings = newSettings;
  // console.log(settings.base);
};

XRate.prototype.config = function(callback) {
  callback(config);
};

