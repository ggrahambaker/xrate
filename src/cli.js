/**
 * @license XRate
 * Copyright (c) 2014 Accretive Technology Group, Inc.  http://accretivetg.com
 * MIT Licensed  https://github.com/accretive/xrate/blob/master/LICENSE
 *
 * @file cli.js - entry point for xrate via command line
 *
 */
'use strict';

var xrate = require('./xrate');

// pass in config file
// var config = {
// 		frequency: 1000,
// 		units: 'bytes',
// 		update: false
// 	};
// var xrate = new XRate(config)

xrate.start();

xrate.on('update', function(info) {
	// log arbitrary information
  console.log(info.o.first);
  console.log(info.i.first);
});

// kill it
setTimeout(function() {
  xrate.stop(function(stats) {
    console.log(stats.o.total + ' :o ');
    console.log(stats.i.total + ' :i ');
  });
}, 10000);
