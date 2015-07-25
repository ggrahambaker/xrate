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
var command = argv._[0];

if (command === 'start') {
  runStart();
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
    console.log('res:\n', res);
  });
}


