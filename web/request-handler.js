var path = require('path');
var archive = require('../helpers/archive-helpers');
var fs = require('fs');
var path = require('path');

// require more modules/folders here!

exports.handleRequest = function(req, res) {
  if (req.method === 'GET') {
    if (req.url === '/') {
      res.writeHead(200, {
        'Content-type': 'text/html'
      });
      fs.readFile(path.join(__dirname, 'public/index.html'), function(err,
        data) {
        console.log(err);
        res.end(data);
      });
    } else if (req.url === '/styles.css') {
      res.writeHead(200, {
        'Content-type': 'text/css'
      });
      fs.readFile(path.join(__dirname, 'public/styles.css'), function(err,
        data) {
        console.log(err);
        res.end(data);
      });
    } else {
      var siteFile = path.join(archive.paths.archivedSites, req.url.replace(/\W/g, ''));

      fs.readFile(siteFile, function(err, data) {
        if (err) {
          res.writeHead(404);
          res.end();
        } else {
          res.writeHead(200, {
            'Content-type': 'text/html'
          });

          res.end(data);
        }
      });
    }
  } else if (req.method === 'POST') {
    if (req.url === '/') {
      var body = '';
      req.on('data', function(chunk) {
        body += chunk;
      });

      req.on('end', function() {
        var parsed = body.replace('url=', '');
        console.log(parsed);
        if (parsed) {
        	console.log(parsed);
          fs.appendFile(archive.paths.list,
            parsed,
            function() {
              res.writeHead(302);
              res.end('done');
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
