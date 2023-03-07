const gulp 				= require('gulp')
const watch 			= require('gulp-watch')
const stylus 			= require('gulp-stylus')
const cleanCSS 			= require('gulp-clean-css')
const autoprefix		= require('gulp-autoprefixer')
const concat 			= require('gulp-concat')
const uglify 			= require('gulp-uglify-es').default
const size 				= require('gulp-size')
const browserSync		= require('browser-sync')
const reload 			= browserSync.reload
const rsync 			= require('rsyncwrapper')
const ttf2woff2 		= require('gulp-ttf2woff2')

//  browser sync & reload
// --------------------------------------------------------------------------
gulp.task('browser-sync', gulp.series(function(done) {
	browserSync({
		port: 8000,
		ui: {
			port: 8081,
		},
		// move JS inserts to head
		snippetOptions: {
			rule: {
				match: /<\/head>/i,
				fn: function (snippet, match) {
					return snippet + match;
				}
			}
		},
		notify: false
	})

	done()
}))

//  js app
// --------------------------------------------------------------------------
gulp.task('js', gulp.series(function(done) {
	gulp.src([
			'./src/js/util.js',
			'./src/js/vendors/*.js',
			'./src/js/init.js',
			'./src/js/*.js',
			'!./src/js/signup.js'
		])
		.pipe(concat('init.js'))
		.pipe(uglify())
		.pipe(size(
			{'title':'init.js'}
		))
		.pipe(gulp.dest('./public/'))
		.pipe(reload({stream:true}))

	done()
}))

//  css minification
// --------------------------------------------------------------------------
gulp.task('css', gulp.series(function(done) {
	gulp.src(['./src/css/reset.styl', './src/css/*.styl', '!./src/css/signup.styl'])
		.pipe(stylus())
		.pipe(concat('init.css'))
		.pipe(autoprefix('last 1 versions'))
	    .pipe(cleanCSS())
		.pipe(size(
			{'title':'init.css'}
		))
		.pipe(gulp.dest('./public/'))
		// .pipe(reload({stream:true}))

	done()
}))

//  signup css
// --------------------------------------------------------------------------
gulp.task('signup_css', gulp.series(function(done) {
	gulp.src(['./src/css/reset.styl', './src/css/signup.styl'])
		.pipe(stylus())
		.pipe(concat('signup.css'))
		.pipe(autoprefix('last 1 versions'))
	    .pipe(cleanCSS())
		.pipe(size(
			{'title':'signup.css'}
		))
		.pipe(gulp.dest('./public/'))
		// .pipe(reload({stream:true}))

	done()
}))

gulp.task('signup_js', gulp.series(function(done) {
	gulp.src(['./src/js/signup.js'])
		.pipe(concat('signup.js'))
		// .pipe(uglify())
		.pipe(size(
			{'title':'signup.js'}
		))
		.pipe(gulp.dest('./public/'))
		.pipe(reload({stream:true}))

	done()
}))

//  watch for edits
// --------------------------------------------------------------------------
gulp.task('watch', gulp.series(gulp.parallel('browser-sync'), function(done) {
	gulp.watch(['./src/css/*/*.styl', './src/css/*.styl', '!./src/css/signup.styl'], gulp.series('css'))
	gulp.watch(['./src/js/*.js', './src/js/vendors/*.js', '!./src/js/signup.js'], gulp.series('js'))

	gulp.watch(['./src/css/signup.styl'], gulp.series('signup_css'))
	gulp.watch(['./src/js/signup.js'], gulp.series('signup_js'))

	gulp.watch('./views/*.pug').on('change', browserSync.reload)
	gulp.watch('./public/*.js').on('change', browserSync.reload)

	done()
}))

//  font gen
// --------------------------------------------------------------------------
gulp.task('fonts', function(){
  gulp.src(['public/*.ttf'])
	.pipe(ttf2woff2())
	.pipe(gulp.dest('public/'));
});

gulp.task('build', gulp.series(['signup_css', 'signup_js', 'css', 'js', 'fonts']))
