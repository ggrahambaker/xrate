/**
 * @license xrate
 * Copyright (c) 2014 Accretive Technology Group, Inc.  http://accretivetg.com
 * For use only by Accretive Technology Group, Inc., its employees and
 * contractors. All rights reserved.
 *
 * @file xrate.js - provides information about incoming and outgoing bandwidth 
 */


var async = require('async')
	, fs = require('fs')
	, winston = require('winston')


var config = {
	frequency : 1000, 
	units : 'bytes', 
	update: false  
}


exports.hello = function() {
	console.log('awake!')
	console.log('\n')
	console.log('done!')
} 