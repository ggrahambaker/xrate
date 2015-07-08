#XRate API
An api for monitoring incoming and outgoing bandwidth usage for Linux servers. The module will report the number of bytes sent and received from the previous last second, the average from the previous minute (by second), as well as the total number of bytes. 


##API
 - xrate
	 - start
	 - Event: 'error'
	 - Event: 'update'
	 - stop
	 - status


##Starting XRate

	$ npm install
 	$ node index.js


##Usage 


###XRate
This is the constructor for XRate. It will use the default settings if unspecified
There are optional config settings:



	var config = {
	    frequency : 1000, // how often statistics are reported
	    units : 'bytes', // 'bytes', 'kilobytes', 'megabytes', 'gigabytes'
	    update: false,  // set true to receive updates
	}

	var xrate = new XRate([config])



###start
Starts logging statistics on incoming and outgoing bandwidth. Initial call returns the initial values in statistics/rx_bytes and statistics/tx_bytes. Pass an empty array as config if you want to use default settings, otherwise use custom options. 

    xrate.start() 


###Event: 'error' 
Xrate will emit an error if something goes wrong while reporting. 

    xrate.on('error', function (err) {
	    console.log(err.code + ': ' + err.message)
    })


###Event: 'update' 
Xrate will emit updates if the client wants information about the bandwidth immediately. Called at the frequency interval. 

    xrate.on('update', function (result) {
	    console.log(result.i.first) // most recent bandwidth usage stats (bytes/second)
		console.log(result.o.average) // average bandwidth usage stats from the last minute (bytes/second)
    })


###stop 
Stops reading and then stops writing to the log. Returns total number of outgoing and incoming bytes.

    xrate.stop(function (stats) {
	    console.log(stats.i.total)
	    console.log(stats.o.total)
    })


###status 
gets most recent entry in the log

    xrate.status(function (result) {
	    console.log(result.i.first) 
		console.log(result.o.average)
    })






