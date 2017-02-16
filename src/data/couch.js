
var http = require('http');
var proc = require('child_process');

var protocol = 'http://';
var hostname = 'couch';
var port = 5986;
var user = 'su';
var password = 'su';

const NO_AUTH_NEEDED = false;



var authHeader = function() {
  return 'Basic ' + new Buffer(user + ':' + password).toString('base64');
}

var url = function(user, password) {
  return protocol + user + ':' + password + '@' + hostname + ':' + port;
}

var questions = [
  { type: 'tf', stem: 'Blue is a color.', answer: true},
  { type: 'tf', stem: 'Dog is an animal.', answer: true},
  { type: 'tf', stem: 'Parrot is a color.', answer: true},
];


var request = function(method, resourcePath, data) {
  return new Promise(function(resolve, reject) {

    var headers = {
      'Content-Type': 'application/json',
    };
    
    var options = {
      hostname,
      port,
      path: resourcePath,
      method: method,
      headers
    };

    var req = http.request(options, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
      });
      res.on('end', () => {
        resolve(true);
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    // write data to request body
    if (data !== undefined) req.write(JSON.stringify(data));
    req.end();
  });
  
}

var fetch = function(resource) {
  return new Promise(function(resolve, reject) {
    http.get(resource, (res) => {
      const statusCode = res.statusCode;
      
      let error;
      if (statusCode !== 200) {
        reject(statusCode);
      } 
      
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => rawData += chunk);
      res.on('end', () => {
        try {
          let parsedData = JSON.parse(rawData);
          resolve(parsedData);
        } catch (e) {
          reject(e.message);
        }
      });
    }).on('error', (e) => {
      reject(e);
    });
  });
}

var insertData = function() {
  return Promise.all(
    questions.map(q => request('POST', '/db', q)));
}

// Connect to the database, retry a half second later if the connection fails
var waitUntilReady = function(initialResolve) {

  console.log("Attempting connection to couch");

  return new Promise(function(resolve, reject) {
    fetch(url())
      .then(v => resolve(true))
      .catch(e => {
        console.log("...error connecting: " + e);
        setTimeout(() => waitUntilReady(
          initialResolve === undefined ? resolve : initialResolve), 500);
      });
  });
}

var createAdmin = function() {
  console.log('About to create admin user');
  return request('PUT', '/_config/admins/su', 'superuser')
}

var createUser = function(name, password) {

}

var run = function() {
  return waitUntilReady()
 //   .then(r => request('PUT', '/db', undefined, NO_AUTH_NEEDED))
 //   .then(r => insertData())
    .then(r => console.log("database ready"));
}

module.exports = run; 





