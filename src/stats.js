// stat
'use strict';

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
  console.log(aveg);
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
      total: self.lastReport,
      average: mean
    };

    callback(toRet);
  });
};

exports.createStat = function() {
  return new Stat();
};
