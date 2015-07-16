var gulp = require("gulp"),
    browserSync = require("browser-sync").create(),
    babel = require("gulp-babel"),
    jade = require("gulp-jade"),
    scss = require("gulp-sass");

function onError(error) {
  console.log(error.toString());
  this.emit("end");
}

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
    .on("error", onError)
  ;
});

gulp.task("js", function() {
  return gulp.src("app/js/**/*.js")
    .pipe(babel())
    .on("error", onError)
    .pipe(gulp.dest("dist/assets/js"))
  ;
});

gulp.task("fonts", function() {
  return gulp.src("app/fonts/**/*.otf")
    .on("error", onError)
    .pipe(gulp.dest("dist/assets/fonts"))
  ;
});

gulp.task("styles", function() {
  return gulp.src("app/scss/**/*.scss")
    .pipe(scss().on("error", scss.logError))
    .on("error", onError)
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

gulp.task("copyData", function() {
  return gulp.src("data/**/*.*")
    .pipe(gulp.dest("dist/assets/data"))
  ;
});

gulp.task("dist", ["templates", "js", "fonts", "styles", "copyImages", "copyVendor", "copyData"]);

gulp.task("watch", ["dist", "browser-sync"], function() {
  gulp.watch("app/templates/**/*.jade", ["templates"]);
  gulp.watch("app/js/**/*.js", ["js"]);
  gulp.watch("app/scss/**/*.scss", ["styles"]);
  gulp.watch("app/imgs/**/*.*", ["copyImages"]);
});
