const gulp 				= require('gulp')
const watch 			= require('gulp-watch')
const stylus 			= require('gulp-stylus')
const cleanCSS 			= require('gulp-clean-css')
const autoprefix		= require('gulp-autoprefixer')
const concat 			= require('gulp-concat')
const uglify 			= require('gulp-uglify-es').default
const stripDebug 		= require('gulp-strip-debug')
const size 				= require('gulp-size')
const browserSync		= require('browser-sync')
const reload 			= browserSync.reload
const rsync 			= require('rsyncwrapper')


//  browser sync & reload
// --------------------------------------------------------------------------
gulp.task('browser-sync', gulp.series(function(done) {
	browserSync({
		// proxy: "http://localhost:3000",
		port: 8000,
		https: {
			key: '/etc/letsencrypt/live/tagpro.dev/privkey.pem',
			cert: '/etc/letsencrypt/live/tagpro.dev/cert.pem',
		},
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
			'./src/js/*.js'
		])
		.pipe(concat('init.js'))
		// .pipe(uglify())
		.pipe(size(
			{'title':'init.js'}
		))
		.pipe(gulp.dest('./public/'))

	done()
}))




//  css minification
// --------------------------------------------------------------------------
gulp.task('css', gulp.series(function(done) {
	gulp.src(['./src/css/main.styl', './src/css/*.styl'])
		.pipe(stylus())
		.pipe(concat('init.css'))
		.pipe(autoprefix('last 2 versions'))
	    .pipe(cleanCSS())
		.pipe(size(
			{'title':'init.css'}
		))
		.pipe(gulp.dest('./public/'))
		.pipe(reload({stream:true}))

	done()
}))


//  watch for edits
// --------------------------------------------------------------------------
gulp.task('watch', gulp.series(gulp.parallel('browser-sync'), function(done) {
	gulp.watch('./src/css/*/*.styl', gulp.series('css'))
	gulp.watch(['./src/js/*.js', './src/js/vendors/*.js'], gulp.series('js'))

	gulp.watch('./views/*.pug').on('change', browserSync.reload)
	gulp.watch('./public/*.js').on('change', browserSync.reload)

	done()
}))
