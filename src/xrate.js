/**
 * @license xrate
 * Copyright (c) 2015 Accretive Technology Group, Inc.  http://accretivetg.com
 * For use only by Accretive Technology Group, Inc., its employees and
 * contractors. All rights reserved.
 *
 * @file xrate.js - provides information about incoming and outgoing bandwidth 
 */


var async = require('async')
	, fs = require('fs')
	, winston = require('winston')
	, path = require('path')
	, buffer = require('buffer')
	, os = require('os')
	, emitter = require('events').EventEmitter
// ===================================

	, settings = {
		base : '/sys/class/net',
		device : 'eth0',
		sent : 'statistics/rx_bytes',
		rcvd : 'statistics/tx_bytes'
	} 
	, log = {
		path : '/home/vagrant/test/xrate/info.log'
	}  


// default config settings
	, config = {
		frequency : 1000, 
		units : 'bytes', 
		update: false  
	} 
	, logger = new (winston.Logger)({
	    transports: [
	      new (winston.transports.File)({ 
	      	filename: log.path, 
	      	level: 'info'
	      })
	    ]
	  })
	, job = null
	, second_index = 0
	, tempLog = [] // keeps track of up records from the last minute
	, seconds = 60
	, lastReport = {
		i : {
			total : 0,
			first : 0,
			average : 0
		},
		o : {
			total : 0,
			first : 0,
			average : 0
		}
	}

exports.start = function(callback){
	
	job = setInterval(function(){
		reader()	
		// issue event!	
	}, config.frequency)
	
	
	logger.info('Up and running!')
	callback('toRet')
}


exports.stop = function(callback){

	clearInterval(job)
	callback('died')
}

exports.status = function(callback){

	callback(lastReport)
}


var reader = function(){
	var syspath = path.normalize(settings.base + '/' + settings.device + '/')
	async.map([syspath + settings.sent, syspath + settings.rcvd], fs.readFile, function(err, results){
		if(err) {
			logger.info('failed to read file')
		}

		var thisRecord = []

		for (var i = 0; i < results.length; i++) {
			thisRecord[i] = results[i].toString().split(os.EOL)[0]
		}
		
		update(thisRecord, function(){
			logger.info(lastReport)
		})
	})
}

var update = function(log, callback){
	// this means this is our first time through
	if(lastReport.o.total === 0){
		lastReport.o.total = log[0]
		lastReport.i.total = log[1] 	
	} else {

		lastReport.o.first = log[0] - lastReport.o.total 
		lastReport.i.first = log[1] - lastReport.i.total 
		
		lastReport.o.total = log[0]
		lastReport.i.total = log[1]
		// calc average
		// console.log('temp log length : ' + tempLog.length)

		// console.log('temp log index, about to be ++ : ' + second_index % seconds)
		tempLog[second_index++ % seconds] = [lastReport.o.first, lastReport.i.first]

		avg(function(){
			callback()	
		})	
	}	
}

var avg = function(callback){
	var o = 0
	, i = 0

	for (var j = 0; j < tempLog.length; j++) {
		o += tempLog[j][0]
		i += tempLog[j][1]
	}
	


	lastReport.o.average = o / tempLog.length
	lastReport.i.average = i / tempLog.length
	callback()
}


