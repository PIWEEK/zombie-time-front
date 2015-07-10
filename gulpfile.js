var gulp = require("gulp"),
    browserSync = require("browser-sync").create(),
    paths = {
      dist: "dist"
    };

gulp.task("browser-sync", function() {
  browserSync.init({
    server: {
      baseDir: paths.dist
    }
  });
});

gulp.task("watch", ["browser-sync"], function() {

});
