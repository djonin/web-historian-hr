var expect = require('chai').expect;
var server = require('../web/basic-server.js');
var fs = require('fs');
var archive = require('../helpers/archive-helpers');
var path = require('path');
var supertest = require('supertest');
var _ = require('underscore');
var rimraf = require('rimraf');

archive.initialize({
  list: path.join(__dirname, '/testdata/sites.txt')
});

var request = supertest.agent(server);

describe('server', function() {
  describe('GET /', function() {
    it('should return the content of index.html', function(done) {
      // just assume that if it contains an <input> tag its index.html
      request
        .get('/')
        .expect(200, /<input/, done);
    });
  });

  describe('archived websites', function() {
    describe('GET', function() {
      it('should return the content of a website from the archive',
        function(done) {
          var fixtureName = 'www.google.com';
          var fixturePath = archive.paths.archivedSites + '/' +
            fixtureName;

          // Create or clear the file.
          var fd = fs.openSync(fixturePath, 'w');
          fs.writeSync(fd, 'google');
          fs.closeSync(fd);

          // Write data to the file.
          fs.writeFileSync(fixturePath, 'google');

          request
            .get('/' + fixtureName)
            .expect(200, /google/, function(err) {
              fs.unlinkSync(fixturePath);
              done(err);
            });
        });

      it('Should 404 when asked for a nonexistent file', function(
        done) {
        request.get('/arglebargle').expect(404, done);
      });
    });

    describe('POST', function() {
      it('should append submitted sites to "sites.txt"', function(
        done) {
        var url = 'http://www.google.com';

        // Reset the test file and process request
        fs.closeSync(fs.openSync(archive.paths.list, 'w'));

        request
          .post('/')
          .send('url='+url)
          .expect(302, function(err) {
            if (!err) {
              var fileContents = fs.readFileSync(archive.paths
                .list, 'utf8');
              expect(fileContents).to.equal('http://www.google.com');
            }

            done(err);
          });
      });
    });
  });
});

describe('archive helpers', function() {
  describe('#readListOfUrls', function() {
    it('should read urls from sites.txt', function(done) {
      var urlCollection = {'http://www.google.com': 'http://www.google.com', 'http://www.gmail.com':'http://www.gmail.com'};
      _.each(urlCollection,function(item) {
        archive.addUrlToList(item);
      });

      archive.readListOfUrls(function(urls) {
        expect(urls).to.deep.equal(urlCollection);
        done();
      });
    });
  });

  describe('#isUrlInList', function() {
    it('should check if a url is in the list', function(done) {
      var urlCollection = {'http://www.google.com': 'http://www.google.com', 'http://www.gmail.com':'http://www.gmail.com'};
      var counter = 0;
      var total = 2;

      _.each(urlCollection, function(url) {
        archive.addUrlToList(url, function() {

          var is = archive.isUrlInList(url);
          expect(is);
          if (++counter === total) {
            done();
          }

          is = archive.isUrlInList('gibberish');
          expect(!is);
          if (++counter === total) {
            done();
          }

        });
      });


    });
  });

  describe('#addUrlToList', function() {
    it('should add a url to the list', function(done) {
      archive.addUrlToList('http://www.google.com', function() {
        is = archive.isUrlInList('http://www.google.com');
        expect(is);
        done();
      });
    });
  });

  describe('#isUrlArchived', function() {
    it('should check if a url is archived', function(done) {
      var counter = 0;
      var total = 2;
      
      archive.addUrlToList('http://www.google.com', function() {
        archive.downloadUrls(undefined, function() {
          archive.isUrlArchived('http://www.google.com', function(exists) {
            expect(exists);
            if (++counter == total) {
              done()
            }
          });
          archive.isUrlArchived('www.notarchived.com', function(exists) {
            expect(!exists);
            if (++counter == total) {
              done()
            }
          });
        });
      });
    });
  });

  describe('#downloadUrls', function() {
    it('should download all pending urls in the list', function(done) {
      var urlArray = ['http://www.reddit.com', 'http://www.remote-bookstrap.com'];
      archive.downloadUrls(urlArray, function() { console.log('asdas');});

      // Ugly hack to wait for all downloads to finish.
      setTimeout(function() {
        expect(fs.readdirSync(archive.paths.archivedSites)).to.deep
          .equal(urlArray);
        done();
      }, 25);
    });
  });
});
