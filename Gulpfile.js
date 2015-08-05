/// <binding />
/// <reference path="typings/tsd.d.ts"/>

var gulp = require('gulp');
var del = require('del');
var path = require('path');

var runSequence = require('run-sequence');
var less = require('gulp-less');
var ts = require('gulp-typescript');
var runElectron = require("gulp-run-electron");
var packager = require('electron-packager');
var bower = require('gulp-bower');

var tsProject = ts.createProject('tsconfig.json',{declarationFiles: true});

var paths = {
  scripts: ['app/**/*.ts',"core/**/*.ts"],
  images: ['img/**/*'],
  less: ['css/**/*.less'],
  html: ['views/**/*.html']
};

//Compile Typescripts and put JS in Build/js
gulp.task('scripts',['core'], function() {
  return gulp
          .src(paths.scripts[0],{base:"./"})
          .pipe(ts(tsProject))
          .js
          .pipe(gulp.dest("./"));
});

gulp.task('core', function() {
  return gulp
          .src(paths.scripts[1])
          .pipe(ts(tsProject))
          .js
          .pipe(gulp.dest("./core"))
});

//Compile all less styles
gulp.task('less', function() {
  return gulp.src(paths.less)
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest('./css'));
});

//Launch nw in the Build folder
gulp.task('run-electron', function(){
  runSequence(['scripts', 'less', 'bower'],
              function(){
                gulp.src("./")
                    .pipe(runElectron([], {}));
              });
});

gulp.task('package', function(){
  runSequence(['scripts', 'less', 'bower'],
              function(){
                var appConfig = require(__dirname + "/package.json");
                  packager({
                      dir: "./",
                      all: true,
                      name: appConfig.application["app-name"],
                      version: appConfig.application["electron-version"],
                      out: "packages",
                      asar : true
                  }, function done(err, appPath) {
                      if (err) {
                          console.error(err);
                          return;
                      }
                      console.log("Application created in : " + appPath);
                  });
              });
});

gulp.task('bower', function () {
    return bower({ directory: './bower_components', cwd:"./app"});
});

// Rerun the task when a file changes
gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts',runElectron.rerun]);
  gulp.watch(paths.images, ['images',runElectron.rerun]);
  gulp.watch(paths.less, ['less',runElectron.rerun]);
  gulp.watch(paths.html, [runElectron.rerun]);
  gulp.watch('./bower.json', ['bower',runElectron.rerun]);
  gulp.watch('./main.js', [runElectron.rerun]);
  gulp.watch('./package.json', [runElectron.rerun]);
  gulp.watch('./storyboard.json', [runElectron.rerun]);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', function(){
  runSequence('run-electron',
              'watch',
              function(){
                console.log('Default ended');
              });
});