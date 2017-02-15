/**
 * Add custom settings to Jasmine.
 */

/*globals jasmine*/

jasmine.VERBOSE = true;

var rep = require('jasmine-reporters');
var reporter = new rep.JUnitXmlReporter("./test-out/out.xml");
jasmine.getEnv().addReporter(reporter);
