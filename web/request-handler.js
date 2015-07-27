var path = require('path');
var archive = require('../helpers/archive-helpers');
var fs = require('fs');
var path = require('path');
// require more modules/folders here!

exports.handleRequest = function (req, res) {
	if(req.method === 'GET') {
		if(req.url === '/') {
			res.writeHead(200, {'Content-type':'text/html'});
			fs.readFile(path.join(__dirname,'public/index.html'), function(err, data) {
				console.log(err);
				res.end(data);
			});
		} else if(req.url === '/styles.css') {
			res.writeHead(200, {'Content-type':'text/css'});
			fs.readFile(path.join(__dirname,'public/styles.css'), function(err, data) {
				console.log(err);
				res.end(data);
			});
		}
	} else if(req.method === 'POST') {
		if(req.url === '/') {
			var body = '';
		  req.on('data', function (chunk) {
		    body += chunk;
		  });

		  req.on('end', function() {
		    var parsed = body.replace('url=', '');
		    if(parsed) {
		    	fs.appendFile(path.join(__dirname,'archives/sites.txt'), parsed, function() {
		    			res.writeHead(302);
		    			res.end();
		    	});
		    } else {
		    	res.writeHead(400);
		    	res.end();
		    }
		  });

		}

	} else {

  	res.end(archive.paths.list);

	}

};
