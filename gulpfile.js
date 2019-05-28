// var gulp = require('gulp');
// var pkg = require('./package.json');
// var cleanCSS = require('gulp-clean-css');
// var rename = require("gulp-rename");
// var uglify = require('gulp-uglify');
// var del = require('del');
// var less = require('gulp-less');
// var babel = require('gulp-babel');
// var concat = require('gulp-concat');


// var files = {
//   styles: {
//     src: 'css/**',
//     dest: 'dist'
//   },
//   scripts: {
//     src: 'js/*.js',
//     dest: 'dist'
//   },
//   getbootstrap:{
//     src: 'node_modules/bootstrap/**',
//     dest: 'dist/'
//   }
// };


// function styles() {
//   return gulp.src(files.styles.src)
//     .pipe(less())
//     .pipe(cleanCSS())
   
//     .pipe(rename({
//       basename: 'odipixel',
//       suffix: '.min'
//     }))
//     .pipe(gulp.dest(files.styles.dest));
// }
// function copy() {
//    return  gulp.src([
//         'node_modules/jquery/dist/*',
//         'node_modules/jquery.easing/*.js',
//          'node_modules/bootstrap/dist/**/*',
//         '!**/npm.js',
//         '!**/*.map',
//         '!**/*.md',
//         'node_modules/magnific-popup/dist/*',
//         'node_modules/scrollreveal/dist/*.js',
//         'node_modules/popper.js/dist/popper.js',
//         'node_modules/popper.js/dist/popper.min.js',
//         'node_modules/@fortawesome/**/**',
//         'node_modules/simple-line-icons/**'
//       ])
//       .pipe(gulp.dest(files.getbootstrap.dest))

   
// }
// function scripts() {
//   return gulp.src(files.scripts.src, { sourcemaps: true })
//     .pipe(babel())
//     .pipe(uglify())
//     .pipe(concat('odipixel.min.js'))
//     .pipe(gulp.dest(files.scripts.dest));
// }

// function watch() {
//   gulp.watch(files.scripts.src, scripts);
//   gulp.watch(files.styles.src, styles);
// }

// var build = gulp.series(gulp.parallel(styles, scripts,copy));


// exports.styles = styles;
// exports.copy = copy;
// exports.scripts = scripts;
// exports.watch = watch;

// exports.build = build;

// exports.default = build;*/
const
  // modules
  gulp = require('gulp'),
  newer = require('gulp-newer'),
  imagemin = require('gulp-imagemin'),
  noop = require('gulp-noop'),
  htmlclean = require('gulp-htmlclean')
  babel = require('gulp-babel');
  // development mode?
  devBuild = (process.env.NODE_ENV !== 'production'),
  concat = require('gulp-concat'),
  deporder = require('gulp-deporder'),
  terser = require('gulp-terser'),
  stripdebug = devBuild ? null : require('gulp-strip-debug'),
  sourcemaps = devBuild ? require('gulp-sourcemaps') : null,
  sass = require('gulp-sass'),
  postcss = require('gulp-postcss'),
  assets = require('postcss-assets'),
  autoprefixer = require('autoprefixer'),
  //mqpacker = require('css-mqpacker'),
  cssnano = require('cssnano'),
  plumber = require("gulp-plumber"),
  rename = require("gulp-rename"),
  cleanCSS = require("gulp-clean-css");
  // folders
  src = './',
  build = './build/'
  ;

  // image processing
function images() {

  const out = build + 'images/';

  return gulp.src(src + 'images/**/*')
    .pipe(newer(out))
    .pipe(imagemin({ optimizationLevel: 5 }))
    .pipe(gulp.dest(out));

}

// HTML processing
function html() {
  const out = build + 'html/';

  return gulp.src(src + 'html/**/*')
    .pipe(newer(out))
    .pipe(devBuild ? noop() : htmlclean())
    .pipe(gulp.dest(out));
}
// JavaScript processing
function js() {

  return gulp.src(src + 'js/**/*')
    .pipe(sourcemaps ? sourcemaps.init() : noop())
    .pipe(babel({
      presets: ['@babel/env']
     }))
    .pipe(deporder())
    .pipe(concat('main.js'))
    .pipe(stripdebug ? stripdebug() : noop())
    .pipe(terser())
    .pipe(sourcemaps ? sourcemaps.write() : noop())
    .pipe(gulp.dest(build + 'js/'));

}
// CSS processing


function css() {

  return gulp.src(src + 'scss/**/*.scss')
    .pipe(sourcemaps ? sourcemaps.init() : noop())
    .pipe(sass({
      outputStyle: 'nested',
      imagePath: '/images/',
      precision: 3,
      errLogToConsole: true
    }).on('error', sass.logError))
    .pipe(postcss([
      assets({ loadPaths: ['images/'] }),
      autoprefixer({ browsers: ['last 2 versions', '> 2%'] }),
      //mqpacker,
     // cssnano
    ]))
    .pipe(sourcemaps ? sourcemaps.write() : noop())
    .pipe(gulp.dest(build + 'scss/'))
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(cleanCSS())
    .pipe(sourcemaps ? sourcemaps.write() : noop())
    .pipe(gulp.dest(build + 'scss/'));

}
// watch for file changes
function watch(done) {

  // image changes
  gulp.watch(src + 'images/**/*', images);

  // html changes
  gulp.watch(src + 'html/**/*', html);

  // css changes
  gulp.watch(src + 'scss/**/*', css);

  // js changes
  gulp.watch(src + 'js/**/*', js);

  done();

}
exports.watch = watch;
exports.css = gulp.series(images, css);
exports.js = js;
exports.images = images;
exports.html = gulp.series(images, html);
exports.build = gulp.parallel(exports.html, exports.css, exports.js);
exports.default = gulp.series(exports.build, exports.watch);
