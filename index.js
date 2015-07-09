/**
 * @license XRate
 * Copyright (c) 2014 Accretive Technology Group, Inc.  http://accretivetg.com
 * MIT Licensed  https://github.com/accretive/xrate/blob/master/LICENSE
 *
 * @file index.js
 *
 */

'use strict';

// module.exports = function(grunt) {

//   var fs = require('fs')
//     , xrate = this

//   this.base = '/sys/class/net'
//   this.device = 'eth0'
//   this.sent = 'statistics/rx_bytes'
//   this.rcvd = 'statistics/tx_bytes'
// }
module.exports = require('./src/cli');
