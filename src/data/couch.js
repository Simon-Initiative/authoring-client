var http = require('http');
var proc = require('child_process');

var protocol = 'http://';
var hostname = 'dev.local';
var port = 5984;
var user = 'su';
var password = 'su';

var skillDocID="-1";
var LODocID="-1";

var url = function() {
  return protocol + user + ':' + password + '@' + hostname + ':' + port;
}

var request = function(method, resourcePath, data) {
  return new Promise(function(resolve, reject) {

    var headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Basic ' + new Buffer(user + ':' + password).toString('base64')
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
      var body = '';
      res.on('data', (chunk) => {
        body += chunk;
        console.log(`BODY: ${chunk}`);
      });
      res.on('end', () => {
        resolve(JSON.parse(body));
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
      
      var error;
      if (statusCode !== 200) {
        reject(statusCode);
      } 
      
      res.setEncoding('utf8');
      var rawData = '';
      res.on('data', (chunk) => rawData += chunk);
      res.on('end', () => {
        try {
          var parsedData = JSON.parse(rawData);
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

var createUser = function(user, password) {
  var data = { 
    name: user, 
    password: password, 
    roles: [], 
    type: "user"
  };
  return request('PUT', `/_users/org.couchdb.user:${user}`, data);
}

var createPermission = function(user, course) {
  var data = { 
    modelType: 'CoursePermissionModel',
    userId: user,
    courseId: course
  };
  return request('POST', '/editor', data);
}

var createUsers = function() {
  return Promise.all([
    createUser('user1', 'user1'),
    createUser('user2', 'user2')
  ]);
}

var createSkills = function(input) {
  return new Promise(function(resolve, reject) {  
    var data = { 
      modelType: 'SkillModel',
      title: {text: 'Sample Skill Model'},
      skills: []
    }
    request('POST', '/editor', data)
      .then(result => { skillDocID=result.id; resolve(input)});
  });  
}

var createLearningObjectives = function(input) {
  return new Promise(function(resolve, reject) {  
    var data = { 
      modelType: 'LearningObjectiveModel',
      title: {text: 'Sample Learning Objective Model'},
      lobjectives: []
    }
    request('POST', '/editor', data)
      .then(result => { LODocID=result.id; resolve(input)});
  });  
}

var createOrganization = function() {
  var data = { 
    modelType: 'OrganizationModel',
    title: {text: 'Sample Organization'},
    skills: []
  }
  return request('POST', '/editor', data);
}

var createCourse = function(users) {
  return new Promise(function(resolve, reject) {
    createOrganization()
      .then(result => {
        var data = { 
          modelType: 'CourseModel',
          title: {text: 'Sample Course'},
          organizations: [result.id],
          learningobjectives: [LODocID],
          skills: [skillDocID]
        };
        
        request('POST', '/editor', data)
          .then(result => resolve({course: result.id, users}));
      });
  });
}

var createSecurityDocument = function(input) {
  return new Promise(function(resolve, reject) {
    var data = { 
        admins: {
          names: [],
          roles: []
        },
        members: {
          names: ['user1', 'user2'],
          roles: []
        }
      }
      request('PUT', '/editor/_security', data)
        .then(result => resolve(input));
  });
}

var createPermissions = function(data) {
  var course = data.course;
  return Promise.all(data.users.map(u => createPermission(u.id, course)));
}

var run = function() {
  return waitUntilReady()
    .then(r => request('PUT', '/editor', undefined))
    .then(r => request('PUT', '/attachments', undefined))
    .then(r => createUsers())    
    .then(r => createSecurityDocument(r))
    .then(r => createLearningObjectives(r))
    .then(r => createSkills(r))    
    .then(r => createCourse(r))
    .then(r => createPermissions(r))
    .then(r => console.log("databases ready"));
}

run(); 
