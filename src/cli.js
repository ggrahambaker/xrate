/**
 * @license XRate
 * Copyright (c) 2014 Accretive Technology Group, Inc.  http://accretivetg.com
 * MIT Licensed  https://github.com/accretive/xrate/blob/master/LICENSE
 *
 * @file cli.js - command line interface for xrate
 *
 */
'use strict';

var xrate = require('./xrate'),
  nopt = require('nopt');

var knownOpts = {
  'units': ['B', 'KB', 'MB', 'GB'],
  'freq': Number,
  'timeLapse': Number
},
shortHands = {
  'default': ['--units', 'B', '--freq', '1000']
},
parsed = nopt(knownOpts, shortHands, process.argv, 2);


var config = {
    frequency: 1000, // how often statistics are reported
    units: 'B' // B, KB, MB, GB, TB, PB
};

config.units = parsed.units ? parsed.units : 'B';
config.frequency = parsed.freq ? parsed.freq : 1000;
config.timeLapse = parsed.timeLapse ? parsed.timeLapse : 2000;


var toEnglish = function(val) {
  if (val === 'B') return 'Byte';
  if (val === 'KB') return 'KiloByte';
  if (val === 'MB') return 'MegaByte';
  if (val === 'GB') return 'GigaByte';
};

xrate.start(config);

setInterval(function() {
  xrate.update(function(last) {
    console.log('Report in (' + toEnglish(config.units) + ') : ');
    console.log('-- recieved --');
    console.log('first : ' + last.i.first + ', total : ' + last.i.total + ', average : ' +
      last.i.average + ', max : ' + last.i.max);
    console.log('-- transmitted --');
    console.log('first : ' + last.o.first + ', total : ' + last.o.total + ', average : ' +
      last.o.average + ', max : ' + last.o.max);
    console.log('');
  });
}, config.timeLapse);

