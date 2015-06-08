/**
 *
 *  .CITY Starter Kit
 *  Copyright 2015 WoT.City Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var browserify = require('gulp-browserify');

// Lint JavaScript
gulp.task('jshint', function () {
  return gulp.src('src/**/*.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
});

gulp.task('apps', function() {
    gulp.src('src/index.js')
        .pipe(browserify({
          insertGlobals : false
        }))
        .pipe(gulp.dest('dist'))
});

// Optimize Images
gulp.task('images', function () {
    return gulp.src('images/**/*')
        .pipe($.cache($.imagemin({
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'))
        .pipe($.size({title: 'images'}));
});

// Watch Files For Changes
gulp.task('watch', function () {
    gulp.watch(['src/*'], ['apps']);
});

// Build Production Files
gulp.task('build', function (cb) {
    runSequence('apps', ['images'], cb);
});

// Default Task
gulp.task('default', [], function (cb) {
    gulp.start('build', cb);
});
