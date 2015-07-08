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
	, util = require('util')
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
		update: true  
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
	, self
	, history = {
		i : {
			total : 0
		}, 
		o : {
			total : 0
		}
	}

// give xrate emitting capabilities
util.inherits(XRate, emitter)
// pass this off somewhere!
module.exports = XRate



/*
* constructor with optional settings, if none are specified, it uses default settings
*/
function XRate(settings){
	if(settings){
		config = settings
	}

	emitter.call(this)	
	self = this
}


XRate.prototype.start = function(){

	job = setInterval(function(){
	
		reader(function(){
			// issue event!
			if(config.update)
				self.emit('update', lastReport)		
		})	
	
	}, config.frequency)
}

/*
* makes xrate stop reporting
*/
XRate.prototype.stop = function(callback){
	clearInterval(job)
	
	callback(history)
}


/*
* reports the most recent ~lastReport~
*/
XRate.prototype.status = function(callback){
	callback(lastReport)
}


/*
* reads incoming and outgoing bandwidth information and then processes it 
* into ~lastReport~ which gives information about bandwidth usage in the last
* second. 
*/
var reader = function(callback){
	var syspath = path.normalize(settings.base + '/' + settings.device + '/')

	// read the info
	async.map([syspath + settings.sent, syspath + settings.rcvd], fs.readFile, function(err, results){
		if(err) {
			this.emit('error', 'error reading file')
		}

		var thisRecord = []

		for (var i = 0; i < results.length; i++) {
			thisRecord[i] = results[i].toString().split(os.EOL)[0]
		}
		
		update(thisRecord, function(){
			//logger.info(lastReport)
			callback()
		})
	})
}

/*
* helper to reader to slot pieces into place 
*/
var update = function(log, callback){
	// this means this is our first time through
	if(lastReport.o.total === 0){
		lastReport.o.total = log[0]
		lastReport.i.total = log[1] 	
	} else {

		lastReport.o.first = log[0] - lastReport.o.total 
		lastReport.i.first = log[1] - lastReport.i.total 
		// pass this to history, 
		// console.log(history.o.total + " : history")
		// console.log(lastReport.o.first + " : lastReport")
		history.o.total += lastReport.o.first 
		history.i.total += lastReport.i.first 

		
		lastReport.o.total = log[0]
		lastReport.i.total = log[1]
		
		// calc average
		tempLog[second_index++ % seconds] = [lastReport.o.first, lastReport.i.first]

		avg(function(){
			callback()	
		})	
	}	
}

/*
* helper for update to break things up a little
*/
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





