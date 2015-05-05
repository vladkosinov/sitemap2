var gulp = require('gulp');
var babel = require('gulp-babel');
var git = require('gulp-git');
var bump = require('gulp-bump');
var filter = require('gulp-filter');
var tag_version = require('gulp-tag-version');
var eslint = require('gulp-eslint');

gulp.task('watch', function () {
    gulp.watch('lib/**/*.js', ['build']);
});

gulp.task('build', function () {
    return gulp.src('lib/**/*.js')
        .pipe(eslint())
        .pipe(eslint.formatEach())
        .pipe(eslint.failOnError())
        .pipe(babel())
        .pipe(gulp.dest('dist'));
});

gulp.task('patch', function () {
    return inc('patch');
});
gulp.task('feature', function () {
    return inc('minor');
});
gulp.task('release', function () {
    return inc('major');
});

function inc(importance) {
    return gulp.src('./package.json')
        .pipe(bump({type: importance}))
        .pipe(gulp.dest('./'))
        .pipe(git.commit('bumps package version'))
        .pipe(filter('package.json'))
        .pipe(tag_version());
}
