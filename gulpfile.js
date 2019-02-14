// -- define root folder as project name -- //

var projectname = 'add_root_folder_name';

// -- define test url -- //

var testurl = projectname + '.localhost';

// -- require gulp plugins -- //

var gulp = require('gulp'),
  autoprefixer = require('gulp-autoprefixer'),
  browserSync = require('browser-sync').create(),
  reload = browserSync.reload,
  sass = require('gulp-sass'),
  cleanCSS = require('gulp-clean-css'),
  sourcemaps = require('gulp-sourcemaps'),
  concat = require('gulp-concat'),
  imagemin = require('gulp-imagemin'),
  changed = require('gulp-changed'),
  uglify = require('gulp-uglify'),
  lineec = require('gulp-line-ending-corrector');

// -- base URLs -- //

var root = '../' + projectname + '/',
  bootstrap = root + 'node_modules/bootstrap/',
  scss = root + 'src/scss/',
  js = root + 'src/js/',
  appdist = root + 'app/',
  jsdist = root + 'app/js/',
  cssdist = root + 'app/css/';

// -- html and stylesheet src paths -- //

var htmlWatchFiles = root + 'src/**/*.html',
  styleWatchFiles = scss + '**/*.scss';

// -- js file src paths -- //

var jsSRC = [
  bootstrap + 'dist/js/bootstrap.bundle.js',
  js + 'app.js'
];

// -- css src paths -- //

var cssSRC = [
  root + 'app/css/app.css'
];

// -- image src paths -- //

var imgSRC = root + 'src/img/*',
  imgDEST = root + 'app/img';

// -- css tasks -- //
// initialize source maps
// add vendor prefixes
// write source maps
// put css file in app/css/ directory

function css() {
  return gulp.src([scss + 'app.scss'])
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(sass({
    outputStyle: 'expanded'
  }).on('error', sass.logError))
  .pipe(autoprefixer('last 2 versions'))
  .pipe(sourcemaps.write())
  .pipe(lineec())
  .pipe(gulp.dest(root + 'app/css/'));
}

// -- combine and optimize css -- //

function concatCSS() {
  return gulp.src(cssSRC)
  .pipe(sourcemaps.init({loadMaps: true, largeFile: true}))
  .pipe(concat('app.min.css'))
  .pipe(cleanCSS())
  .pipe(sourcemaps.write('./maps/'))
  .pipe(lineec())
  .pipe(gulp.dest(cssdist));
}

// -- combine and optimize js -- //

function javascript() {
  return gulp.src(jsSRC)
  .pipe(concat('app.js'))
  .pipe(uglify())
  .pipe(lineec())
  .pipe(gulp.dest(jsdist));
}

// -- optimize images -- //

function imgmin() {
  return gulp.src(imgSRC)
  .pipe(changed(imgDEST))
  .pipe(imagemin([
    imagemin.gifsicle({interlaced: true}),
    imagemin.jpegtran({progressive: true}),
    imagemin.optipng({optimizationLevel: 5})
  ]))
  .pipe(gulp.dest(imgDEST));
}

// -- move html files to app directory -- //

function copyHTML() {
  return gulp.src(htmlWatchFiles)
  .pipe(lineec())
  .pipe(gulp.dest(appdist));
}

// -- watch files and reload browser when changes are made -- //

function watch() {
  browserSync.init({
    proxy: testurl
  });
  gulp.watch(styleWatchFiles, gulp.series([css, concatCSS]));
  gulp.watch(jsSRC, javascript);
  gulp.watch(imgSRC, imgmin);
  gulp.watch(htmlWatchFiles, copyHTML).on('change', browserSync.reload);
  gulp.watch([jsdist + 'app.js', cssdist + 'app.min.css']).on('change', browserSync.reload);
}

// -- exports -- //

exports.css = css;
exports.concatCSS = concatCSS;
exports.javascript = javascript;
exports.watch = watch;
exports.imgmin = imgmin;
exports.copyHTML = copyHTML;

// -- default gulp watch task -- //

var build = gulp.parallel(watch);
gulp.task('default', build);
