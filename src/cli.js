/**
 * @license xrate
 * Copyright (c) 2014 Accretive Technology Group, Inc.  http://accretivetg.com
 * For use only by Accretive Technology Group, Inc., its employees and
 * contractors. All rights reserved.
 *
 * @file cli.js - CLI handling for xrate.
 */


var xrate = require('./xrate')


xrate.start(function(result){
	
	console.log('returnedd')
	console.log(result)

	
})


setTimeout(function(){
	xrate.stop(function(msg){
		console.log(msg)
	})
}, 66000)