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

var converter = require('byte-converter').converterBase2;

/**
 * Stat Object
 */
var Stat = function(units) {
  var self = this;
  this.lastReport = 0;
  this.count = 0;
  this.unit = units;

  this.last = {
    first: 0,
    total: 0,
    average: 0,
    max: 0
  };

  // ===================================
  // Methods

  /**
   * @param current figure on bandwidth
   * take raw value and turn it to per second
   */
  this.addEntry = function(entry) {
    // if its the first thing
    if (self.lastReport === 0) {
      self.lastReport = entry;
      // console.log('addEntry: ' + self.lastReport);
    } else {
      self.last.first = entry - self.lastReport;
      // console.log('addEntry: ' + util.inspect(self.last));
      if (self.last.first > self.last.max) {
        self.last.max = self.last.first;
      }
      // updates the last report so we can compare it next time
      self.lastReport = entry;
      // updates total, and how many items we have recorded
      self.last.total += self.last.first;
      self.count++;
      // set average..
      self.last.average = (self.last.total / self.count).toFixed(2);
    }
    self.convert();
  };

  this.convert = function() {
    for (var index in self.last) {
      self.last[index] = Number(converter(self.last[index], 'B', self.unit).toFixed(2));
    }
  };
};


/**
 * outward facing point of contact
 */
exports.createStat = function(unit) {
  return new Stat(unit);
};
