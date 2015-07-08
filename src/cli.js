/**
 * @license xrate
 * Copyright (c) 2014 Accretive Technology Group, Inc.  http://accretivetg.com
 * For use only by Accretive Technology Group, Inc., its employees and
 * contractors. All rights reserved.
 *
 * @file cli.js - CLI handling for xrate.
 */


var XRate = require('./xrate')


// pass in config file
var config = {
		frequency : 1000, 
		units : 'bytes', 
		update: false  
	} 

var xrate = new XRate(config)

xrate.start()

xrate.on('update', function(info){
	// log arbitrary information
	console.log(info.o.first)
	console.log(info.i.first)
})

// kill it
setTimeout(function(){
	xrate.stop(function(stats){
		console.log(stats.o.total + " :o")
		console.log(stats.i.total + " :i")
	})
}, 10000)