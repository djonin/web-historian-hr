var fs = require('fs');
var path = require('path');
var _ = require('underscore');

/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */

var list = {};

exports.paths = {
  siteAssets: path.join(__dirname, '../web/public'),
  archivedSites: path.join(__dirname, '../archives/sites'),
  list: path.join(__dirname, '../archives/sites.txt')
};

// Used for stubbing paths for tests, do not modify
exports.initialize = function(pathsObj) {
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });

  exports.readListOfUrls(function(res) {
    list = res;
  });
};

// The following function names are provided to you to suggest how you might
// modularize your code. Keep it clean!

exports.readListOfUrls = function(callback) {
  fs.readFile(exports.paths.list, function(err, res) {
    console.error(err);
    callback(JSON.parse(res));
  });
};

exports.isUrlInList = function(url) {
  return list.hasOwnProperty(url);
};

exports.addUrlToList = function(url, callback) {
  list[url] = url;
  var text = JSON.stringify(list);
  fs.writeFile(exports.paths.list, text, callback);
};

exports.isUrlArchived = function(url, callback) {
  if (!exports.isUrlInList(url)) {
    return callback(false);
  }

  fs.exists(path.join(exports.paths.archivedSites, url), function(exists) {
    callback(exists);
  });
};

exports.downloadUrls = function() {};
