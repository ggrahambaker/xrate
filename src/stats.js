/**
 * @license XRate
 * Copyright (c) 2014 Accretive Technology Group, Inc.  http://accretivetg.com
 * MIT Licensed  https://github.com/accretive/xrate/blob/master/LICENSE
 *
 * @file stats.js - helper module that breaks out
 * the logic of remembering data from the place that fetches it
 *
 */
var util = require('util');

/**
 * constructor
 */
var Stat = function() {
  var self = this
  this.average = 0
  this.lastEntries = []
  this.first = 0
  this.lastReport = 0
  this.count = 0
  this.limit = 60
  this.total = 0
  this.max = 0



  //===================================
  //Methods

  /**
   * @param current figure on bandwidth
   * take raw value and turn it to per second
   */
  this.addEntry = function(entry) {
    // if its the first thing
    if (self.lastReport === 0) {
      self.lastReport = entry;
    } else {
      self.first = entry - self.lastReport;
      if(self.first > self.max) {
        self.max = self.first
      }
      self.lastReport = entry;
      self.lastEntries[self.count++ % self.limit] = self.first;
      self.total += self.first;
    }
  };


  this.isEmpty = function() {
    return this.length === 0
  }

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
    // console.log(aveg + ' ->> aveg')

    callback(aveg);
  };


  this.last = function() {
    return this.total;
  };

  /**
  * reports stats
  * if first time around, it will tell xrate that its initializing now
  */
  this.report = function(callback) {

    if(self.lastEntries.length < 5) {
      callback(true);
      return;
    } else {
      //console.log(' or her here?? ')
      crunch(self.lastEntries, function(mean) {
        callback(null, {
          first: self.first,
          total: self.total,
          average: mean,
          max: self.max
        });
      });
    }
  };
};


/**
 * outword facing point of contact
 */
exports.createStat = function() {
  return new Stat();
};
