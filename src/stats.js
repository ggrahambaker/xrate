/**
 * @license XRate
 * Copyright (c) 2014 Accretive Technology Group, Inc.  http://accretivetg.com
 * MIT Licensed  https://github.com/accretive/xrate/blob/master/LICENSE
 *
 * @file stats.js - helper module that breaks out
 * the logic of remembering data from the place that fetches it
 *
 */
'use strict';

/**
 * constructor
 */
var Stat = function() {
  var self = this;
  self.average = 0;
  self.lastEntries = [];
  self.first = 0;
  self.lastReport = 0;
  self.count = 0;
  self.limit = 60;
  self.total = 0;
};

/**
 * @param current figure on bandwidth
 * take raw value and turn it to per second
 */
Stat.prototype.addEntry = function(entry) {
	// if its the first thing
  var self = this;
  if (self.lastReport === 0) {
    self.lastReport = entry;
  } else {
    self.first = entry - self.lastReport;
    self.lastReport = entry;
    self.lastEntries[self.count++ % self.limit] = self.first;
    self.total += self.first;
  }
};

Stat.prototype.lastReport = function() {
  return this.first;
};
/**
 * helper to report mb/sec
 */
var crunch = function(history, callback) {
  // console.log(history.length)
  var aveg = 0;
  var off = 0;
  for (var i = 0; i < history.length; i++) {
    if (history[i] === 0) {
      off++;
      continue;
    }
    aveg += history[i];
  }

  aveg = aveg / (history.length - off);
  callback(aveg);
};

Stat.prototype.last = function() {
  var self = this;
  return self.total;
};

Stat.prototype.report = function(callback) {
  var self = this;
  var toRet = {};

  crunch(self.lastEntries, function(mean) {
    // console.log(this.first + ' self - first');
    // console.log(mean + ' self - mean');
    toRet = {
      first: self.first,
      total: self.total,
      average: mean
    };

    callback(toRet);
  });
};
/**
 * outword facing point of contact
 */
exports.createStat = function() {
  return new Stat();
};
