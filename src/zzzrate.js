'use strict';


var xplus = require('../build/Release/xrateplus');


  // plug this section into the "start" method, between the interval.
  // if you want to test it toggle console.log


      // var cat = spawn('cat',['/proc/net/dev']);


      // cat.stdout.on('data', function (data) {
      //     var entry = data.toString().split('\n');
      //     var eth1 = entry[3].split(/[ ,]+/);
      //     var eth0 = entry[4].split(/[ ,]+/);
      //     // console.log(eth1)
      //     var byIn = Number(eth0[2]) + Number(eth1[2]);
      //     var byOut = Number(eth0[10]) + Number(eth1[10]);
      //     // console.log(byIn)
      //     // console.log(byOut)
      //     self.iStat.addEntry(byIn);
      //     self.oStat.addEntry(byOut);
      // });

      // cat.on('close', function (code) {
      //   cat = null;
      // });




var inreport = {
  first: 0,
  max: 0,
  total: 0,
  average: 0,
  last: 0,
  count: 0
};

var outreport = {
  first: 0,
  max: 0,
  total: 0,
  average: 0,
  last: 0,
  count: 0
};

var job = null;
var lastA = 0, lastB = 0;
var a = 0, b = 0;
var start = function() {
  // toggle console.logs to see behavior,
  job = setInterval(function() {
      if(lastA === 0) {
        lastA = parseInt(xplus.bytesIn(), 10);
        lastB = parseInt(xplus.bytesOut(), 10);
      } else {
        var tempA = parseInt(xplus.bytesIn(), 10);
        var tempB = parseInt(xplus.bytesOut(), 10);
        a += (tempA - lastA);
        b += (tempB - lastB);
        lastA = tempA;
        lastB = tempB;

      }
        console.log(a + ' :a')
        console.log(b + ' :b')

  }, 5000)

}

var report = function(callback) {

  callback({i:a, o:b})
  // callback({
  //   i: inreport,
  //   o: outreport
  // });
}

var consumeStats = function(stin, stout) {
  modifiy(stin, inreport);
  modifiy(stout, outreport);
}

var modifiy = function(newEntry, report) {
  if (report.last === 0) {
    report.last = newEntry;
    return;
  }

  report.first = newEntry - report.last;
  if(report.first > report.max)
    report.max = report.first;

  report.last = newEntry;

  report.total += report.first;
  report.count++;
  report.average = (report.total / report.count).toFixed(2);

}


exports.start = start;
exports.report = report;
