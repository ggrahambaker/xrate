/**
 * @license XRate
 * Copyright (c) 2014 Accretive Technology Group, Inc.  http://accretivetg.com
 * MIT Licensed  https://github.com/accretive/xrate/blob/master/LICENSE
 *
 * @file cli.js - entry point for xrate via command line
 *
 */
'use strict';
var xrate = require('./xrate'),
  // os = require('os'),
  // stream = require('stream'),
  minimist = require('minimist');

process.title = 'Xrate';

var argv = minimist(process.argv.slice(2), {});

// var started = Date.now();
// function getRuntime () {
//   return Math.floor((Date.now() - started) / 1000);
// }

var command = argv._[0];

if (command === 'help' || argv.help) {
  help();
} else if (command === 'start' || argv.help) {
  runStart();
} else if (command === 'status' || argv.help) {
  console.log('status');
} else if (command === 'stop' || argv.help) {
  console.log('stop');
} else if (command === 'update' || argv.help) {
  console.log('update');
} else {
  help();
}

function help() {
  console.log();
  console.log('helpText');
  console.log();
}


function runStart(config) {
  if (!xrate.state.running) {
    if (config) {
      xrate.start();
    }
    xrate.start();
  }

  xrate.on('init', function() {
    process.stdout.write('starting up now!');
  });

  xrate.on('update', function(res) {
    // var average = info.i.average.toString();
    console.log('res\n', res);
    // console.log(is)
    // process.stdout.write(info.o.average)
  });

  // setTimeout(function() {
  //   xrate.status(function(err, res) {
  //     console.log('status res\n', res);
  //   });
  // }, 5000);
}
//   helpText = exports.helpText =
//     'Usage: index.js <action>' + os.EOL +
//     '   --start       :xrate starts monitoring bandwidth usage' + os.EOL +
//     '   --status      :most recent bandwidth usage stats' + os.EOL +
//     '   --stop        :stop xrate' + os.EOL +
//     '   --help        :help text' + os.EOL +
//     '   --update      :recieve updates from xrate' + os.EOL +
//     '   --frequency   :set how frequency you want update (in ms)' + os.EOL +
//     '   --units       :what unit you want data reported to you. (bytes, mb, gb)' + os.EOL,

//   knownOpts = exports.knownOpts = {
//     'please' : String,
//     'update' : Boolean,
//     'frequency' : Number,
//     'units' : String
//   },

//   shortHandOpts = exports.shortHandOpts = {
//     'h' : ['--help'],
//     'u' : ['--update'],
//     'f' : ['--frequency']
//   },

//   options = exports.options = nopt(knownOpts, shortHandOpts),

//   state = exports.state = {
//     // If we're in the middle of exiting
//       exit: {
//           exiting: false
//         , code: 0
//         , source: 'run'
//         , callback: null
//         , setup: false
//       }
//     // Whether or not the last status line showed no activity
//     , lastStatusZero: true
//   }
// var run = exports.run = function(callback) {
//   if(options.help)

// }

/*
// pass in config file
var config = {
    frequency: 1000,
    units: 'bytes',
    update: true
  };

xrate.start(config);

xrate.on('update', function(info) {
  // log arbitrary information
  console.log('i/o');
  console.log(info.i + ' : i');
  console.log(info.o + ' : o');
});

// kill it
setTimeout(function() {
  xrate.status(function(report) {
    console.log('-------------');
    console.log(report.i.first + ' - i status');
    console.log(report.o.first + ' - o status');

    console.log('-------------');
    xrate.stop(function(stats) {
      console.log(stats.o.total + ' :o ');
      console.log(stats.i.total + ' :i ');
    });
  });
}, 10000);
*/

