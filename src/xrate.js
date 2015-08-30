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
  stats = require('./stats');

var settings = {
      base: '/sys/class/net',
      device: 'eth0',
      sent: 'statistics/rx_bytes',
      rcvd: 'statistics/tx_bytes'
    };


util.inherits(XRate, emitter);
module.exports = new XRate();

/**
 * Constructor for XRate
 */
function XRate() {
  var self = this;
  // default config
  this.config = {
    frequency: 1000,
    units: 'bytes',
    update: true
  };

  this.job = null;
  this.oStat = null;
  this.iStat = null;

  // ================= Private Methods =================
  /**
   * @function setUp
   * grabs the fds for rx and tx bytes
   */
  var setUp = function(done) {
    var syspath = path.normalize(settings.base + '/' + settings.device + '/');
    async.series({
      send: function(callback) {
        fs.open(syspath + settings.sent, 'r', function(err, openfd) {
          if (err) {
            self.emit('error', err);
            return callback(err);
          }
          callback(null, openfd);
        });
      },
      recv: function(callback) {
        fs.open(syspath + settings.rcvd, 'r', function(err, openfd) {
          if (err) {
            self.emit('error', err);
            return callback(err);
          }
          callback(null, openfd);
        });
      }
    }, function(err, results) {
      if (err) {
        return done(err);
      }
      done(null, results);
    });
  };

  var beginLogging = function(readFD) {
    self.job = setInterval(function() {
      if (self.config.update) {
        self.emit('update', {
          i: self.oStat.last,
          o: self.iStat.last
        });
      }
      var inStream = fs.createReadStream('', {fd: readFD.recv, flags: 'r', start: 0, autoClose: false});
      var outStream = fs.createReadStream('', {fd: readFD.send, flags: 'r', start: 0, autoClose: false});

      inStream.once('data', function(chunk) {
        chunk = chunk.toString().split(os.EOL)[0];
        self.iStat.addEntry(chunk);
      });

      outStream.once('data', function(chunk) {
        chunk = chunk.toString().split(os.EOL)[0];
        self.oStat.addEntry(chunk);
      });
    }, 1000);
  };

  // ================= Public Methods =================
  /**
   * @function star
   * begins the bandwidth recording process
   */
  this.start = function(settings) {
    self.oStat = stats.createStat();
    self.iStat = stats.createStat();
    if (settings) {
      self.config = settings;
      console.log(self.config);
    }
    setUp(function(err, rStreams) {
      if (err) {
        return err;
      }
      beginLogging(rStreams);
    });
  };
  /**
   * @function update
   * reports the incoming and outgoing
   * bandwidth usage stats
   */
  this.update = function(callback) {
    callback({
      i: self.oStat.last,
      o: self.iStat.last
    });
  };
  /**
   * @function stop
   * stops the bandwidth recording process and reports
   * the last recorded data
   */
  this.stop = function(callback) {
    clearInterval(self.job);
    callback({
          i: self.oStat.last,
          o: self.iStat.last
        });
  };

  this.settings = function(newSettings) {
    settings = newSettings;
    return settings;
  };
}
