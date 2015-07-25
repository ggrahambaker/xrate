
var xrate = require('xrate')
  , util =  require('util')

xrate.start()

var test = function() {
  xrate.status(function(err, res) {
    if(err) {
      console.log(err)
    } else {
      console.log(util.inspect(res))
    }
  });
}


setInterval(test, 5000)
