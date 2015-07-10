var gulp = require("gulp"),
    browserSync = require("browser-sync").create(),
    babel = require("gulp-babel"),
    jade = require("gulp-jade");

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
    .pipe(jade())
    .pipe(gulp.dest("dist"))
  ;
});

gulp.task("js", function() {
  return gulp.src("app/js/**/*.js")
    .pipe(babel())
    .pipe(gulp.dest("dist/assets/js"))
  ;
});

gulp.task("dist", ["templates", "js"]);

gulp.task("watch", ["dist", "browser-sync"], function() {
  gulp.watch("app/templates/**/*.jade", ["templates", browserSync.reload]);
  gulp.watch("app/js/**/*.js", ["js", browserSync.reload]);
});
