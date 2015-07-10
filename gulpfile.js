var gulp = require("gulp"),
    browserSync = require("browser-sync").create(),
    babel = require("gulp-babel"),
    jade = require("gulp-jade"),
    scss = require("gulp-sass");

gulp.task("browser-sync", function() {
  browserSync.init({
    server: {
      baseDir: "dist"
    },
    notify: false,
    open: false
  });
});

gulp.task("templates", function() {
  return gulp.src("app/templates/**/*.jade")
    .pipe(jade({pretty: true}))
    .pipe(gulp.dest("dist"))
  ;
});

gulp.task("js", function() {
  return gulp.src("app/js/**/*.js")
    .pipe(babel())
    .pipe(gulp.dest("dist/assets/js"))
  ;
});

gulp.task("styles", function() {
  return gulp.src("app/scss/**/*.scss")
    .pipe(scss().on("error", scss.logError))
    .pipe(gulp.dest("dist/assets/css"))
  ;
});

gulp.task("copyImages", function() {
  return gulp.src("app/imgs/**/*.*")
    .pipe(gulp.dest("dist/assets/imgs"))
  ;
});

gulp.task("copyVendor", function() {
  return gulp.src("vendor/**/*.*")
    .pipe(gulp.dest("dist/vendor"))
  ;
});

gulp.task("dist", ["templates", "js", "styles", "copyImages", "copyVendor"]);

gulp.task("watch", ["dist", "browser-sync"], function() {
  gulp.watch("app/templates/**/*.jade", ["templates", browserSync.reload]);
  gulp.watch("app/js/**/*.js", ["js", browserSync.reload]);
  gulp.watch("app/scss/**/*.scss", ["styles", browserSync.reload]);
  gulp.watch("app/imgs/**/*.*", ["copyImages", browserSync.reload]);
});
