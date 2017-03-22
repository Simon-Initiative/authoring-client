
"use strict";

var gulp = require('gulp');
var open = require('gulp-open');
var del = require('del');
var gutil = require('gulp-util');
var run = require('gulp-run');
var webpack = require('webpack');
var args = require('yargs').argv;
var WebpackDevServer = require("webpack-dev-server");
var $ = require('gulp-load-plugins')({lazy: true});
var webpackDistConfig = require('./webpack.dist.js');
var webpackDevConfig = require('./webpack.dev.js');
var fs = require('fs');
//var runDataInit = require('./src/data/couch.js');

var exec = require('child_process').exec;
 

var runSequence = require('run-sequence');

var config = {
  srcDir: "./src",
  devDir: "./dev",
  distDir: "./dist"
}

var setupChalk = $.util.colors.bgYellow;
var setupLog = function(str) {
  //log(setupChalk(str));
  $.util.log($.util.colors.bgYellow(str));
};
gulp.setupLog = setupLog;

var fileChangeLog = function(str) {
  $.util.log($.util.colors.bgBlue(str));
};

var etcLog = function(str) {
  $.util.log($.util.colors.bgCyan(str));
};

var port = 9000;

gulp.task('setupDist', function() {
  setupLog("Setup for dist: Copying files to " + config.distDir);

  gulp.src('./icons/style.css')
        .pipe(gulp.dest(config.distDir + '/assets'));

  gulp.src('./icons/fonts/icomoon*')
        .pipe(gulp.dest(config.distDir + '/assets/fonts'));

  var patterns = ["./index.html",
                  "/../assets/*",                   
                  config.srcDir + '/vendor/**/*.*'];

  setupLog("Patterns: " + patterns);

  return gulp.src(patterns, {base: '.'})
    .pipe($.print())
    .pipe(gulp.dest(config.distDir));
});

gulp.task('setupDev', function() {
  setupLog("Setup for dev: Copying files to " + config.devDir);

   gulp.src('./icons/style.css')
        .pipe(gulp.dest(config.devDir + '/assets'));

  gulp.src('./icons/fonts/icomoon*')
        .pipe(gulp.dest(config.devDir + '/assets/fonts'));

  var patterns = [config.srcDir + "/../index.html",
                  config.srcDir + "/../assets/*",
                   config.srcDir + '/vendor/**/*.*'];

  setupLog("Patterns: " + patterns);

  return gulp.src(patterns, {base: '.'})
    .pipe($.print())
    .pipe(gulp.dest(config.devDir));

});

gulp.task('watchForWebpack', function() {
    // When any src or test file changes, then re-run webpack
  var watcher = gulp.watch(config.srcAndTestJs);  //, ['webpack:build-dev']
  watcher.on('change', function(event) {
    fileChangeLog('Event type: ' + event.type); // added, changed, or deleted
    fileChangeLog('Event path: ' + event.path); // The path of the modified file

    runSequence('webpack:build-dev', 'webpack:build-dev');
  });
});

gulp.task('clean', function() {
  // No-op, here for extensibility by individual projects
});

gulp.task('clean:dev', function() {
  return del([
    'dev/vendor'
  ]).then(paths => {
    gutil.log("[clean:dev]\n", paths.join('\n'));
  });
});


gulp.task('build', function(callback) {
  // run webpack
  webpack(webpackDistConfig, function(err, stats) {
      if(stats.hasErrors()) {
        var json = stats.toJson();
        console.log(json.errors.reduce((p, c) => p + '\n' + c, ''));
        callback('Errors');
      } else {
        callback();
      }
  });
});

gulp.task('initData', function(cb) {
  runDataInit()
    .then(r => cb())
    .catch(r => cb(r));
});

gulp.task('enableCors', function(cb) {
  exec('node ./node_modules/add-cors-to-couchdb/bin.js http://couch:5984',
    function() {
      cb();
    });
});


gulp.task('dev', function(cb) {
  runSequence('prelude', 'clean:dev', 'setupDev', 'serve', cb);
});

gulp.task('dist', function(cb) {
  runSequence('prelude', 'clean', 'setupDist', 'build', 'postdist', cb);
});



gulp.task('test', function(cb) {
  runSequence('clean:test', 'setup:test', 'exec:test', cb);
});

gulp.task('test-dist', function(cb) {
  runSequence('test', 'dist', cb);
});



gulp.task('clean:test', function(cb) {
  fs.unlink('test-out/results.txt', () => {
    return fs.rmdir('test-out', () => cb());
  });
  
});

gulp.task('setup:test', function(cb) {
  return fs.mkdir('test-out', () => cb());
});


gulp.task('exec:test', function(cb) {
  return exec('jest',(error, stdout, stderr) => {
    
    fs.writeFile('test-out/results.txt', stderr, (err) => {
      if (err) {
        cb(err);
        return;
      }
      cb(error);
    });
    
    console.log(stderr);
  });

});

gulp.task('prelude', function() {
  // No-op, here for extensibility by individual projects
});

gulp.task('postdist', function() {
  // No-op, here for extensibility by individual projects
});

gulp.task('open', function(){
  var options = {
    uri: 'http://localhost:' + port + '/webpack-dev-server/index.html'
  };
  gulp.src('').pipe(open(options));
});

gulp.task('serve', function(callback) {
  // Start a webpack-dev-server
  for (var i = 0; i < webpackDevConfig.entry.length; i++) {
    if (webpackDevConfig.entry[i].startsWith("webpack-dev-server/client")) {
      var replacement = "webpack-dev-server/client?http://127.0.0.1:" + port;
      setupLog(`Replace entry point: ${webpackDevConfig.entry[i]} with ${replacement}`);
      webpackDevConfig.entry[i] = replacement;
      break;
    }
  }

  var compiler = webpack(webpackDevConfig);

  new WebpackDevServer(compiler, {

      path: webpackDevConfig.output.path,
      // webpack-dev-server options
      contentBase: webpackDevConfig.devServer.contentBase,
      // or: contentBase: "http://localhost/",

      hot: true,
      // Enable special support for Hot Module Replacement
      // Page is no longer updated, but a "webpackHotUpdate" message is send to the content
      // Use "webpack/hot/dev-server" as additional module in your entry point
      // Note: this does _not_ add the `HotModuleReplacementPlugin` like the CLI option does.

      // webpack-dev-middleware options
      quiet: false,
      noInfo: false,
      lazy: false,
      filename: "main.js",
      watchOptions: {
        aggregateTimeout: 300,
        poll: 1000
      },
      //headers: { "X-Custom-Header": "yes" },
      stats: { colors: true },

      // Set this as true if you want to access dev server from arbitrary url.
      // This is handy if you are using a html5 router.
      historyApiFallback: false,

      // Set this if you want webpack-dev-server to delegate a single path to an arbitrary server.
      // Use "*" to proxy all paths to the specified server.
      // This is useful if you want to get rid of 'http://localhost:8080/' in script[src],
      // and has many other use cases (see https://github.com/webpack/webpack-dev-server/pull/127 ).
      //proxy: {
      //  "*": "http://localhost:9090"
      //}
  }).listen(port, "0.0.0.0", function(err) {

      if(err) throw new gutil.PluginError("serve", err);
      // Server listening
      gutil.log("[serve]", "http://localhost:" + port + "/webpack-dev-server/index.html");


      // keep the server alive or continue?
      // callback();
  });

});


// Default is to run the unit tests and the server task
gulp.task('default', function() {
    gutil.log("[default]", "Available tasks are:");
    gutil.log("[default]", "------------------------------------------------------");
    gutil.log("[default]", "dev        - runs project in webpack dev server");
    gutil.log("[default]", "dist       - builds the webpack dist version of project");
    gutil.log("[default]", "test       - runs all unit tests");
    gutil.log("[default]", "test-dist  - runs tests then builds dist");
    gutil.log("[default]", "------------------------------------------------------");
});
