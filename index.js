// test.js
'use strict';

//tests regular xrate

var xrate = require('./src/xrate'),
  util = require('util');

var settings = {
  frequency: 1000,
  units: 'bytes',
  update: true
}

xrate.start(settings);
console.log('start');

function wait() {
  xrate.update(function(stats) {
    console.log('sí: \n' + util.inspect(stats));
  });
}


setInterval(wait, 5000);


//tests zzzrate.js (addon version)

// var xplus = require('./build/Release/xrateplus')


// setInterval(function() {
//   xplus.bytesIn();
// //  console.log('ooo: ' + xplus.bytesIn() + '\n')
// }, 1000)


// test the proc way of getting the information..

// var zplus = require('./src/zzzrate.js')


// zplus.start();
// console.log('start');

// function wait() {
//   zplus.report(function(stats) {
//     console.log('sí: \n' + util.inspect(stats));
//   });
// }


// setInterval(wait, 5000);
