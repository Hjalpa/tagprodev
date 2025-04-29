const esbuild 			= require('esbuild')
const chokidar 			= require('chokidar')
const {stylusLoader} 	= require('esbuild-stylus-loader')
const fs 				= require('fs')
const path 				= require('path')
const browserSync		= require('browser-sync')

//  app
// --------------------------------------------------------------------------
const rebuildAppJS = () => {
	// start concat JS files
	function getAllFiles(dir, fileList = []) {
		const files = fs.readdirSync(dir);
		files.forEach(file => {
			const filePath = path.join(dir, file);
			if (fs.statSync(filePath).isDirectory())
				getAllFiles(filePath, fileList);
			else
				fileList.push(filePath);
		});
		return fileList;
	}

	const sourceDir = './src/app/js';
	const allFiles = getAllFiles(sourceDir);

	const orderedFiles = allFiles.sort((a, b) => {
		const fileNameA = path.basename(a);
		const fileNameB = path.basename(b);

	// Prioritize util.js over init.js
	if (fileNameA === 'util.js') return -1;
	if (fileNameB === 'util.js') return 1;

	if (fileNameA === 'init.js') return 1;
	if (fileNameB === 'init.js') return -1;

		return fileNameA.length - fileNameB.length
	})

	const concatenatedContents = orderedFiles.map(filePath => {
		return fs.readFileSync(filePath, 'utf8');
	}).join('\n')

	fs.writeFileSync('./public/app.js', concatenatedContents, 'utf8')
	// end concat JS files

	esbuild.build({
		bundle: false,
		minify: true,
		allowOverwrite: true,
		entryPoints: [`./public/app.js`],
		outfile: './public/app.js',
	})
    .then(() => console.log("- app.js"))
    .catch(() => process.exit(1))
}

const rebuildAppCSS = () => {
	esbuild.build({
		entryPoints: ['./src/app/css/main.styl'],
		bundle: true,
		plugins: [stylusLoader()],
		outfile: './public/app.css',
		minify: true,
		external: ['*.woff2'],
	})
    .then(() => console.log("- app.css"))
    .catch(() => process.exit(1))
}

//  signup
// --------------------------------------------------------------------------
const rebuildSignupJS = () => {
	// start concat JS files
	function getAllFiles(dir, fileList = []) {
		const files = fs.readdirSync(dir);
		files.forEach(file => {
			const filePath = path.join(dir, file);
			if (fs.statSync(filePath).isDirectory())
				getAllFiles(filePath, fileList);
			else
				fileList.push(filePath);
		});
		return fileList;
	}

	const sourceDir = './src/signup/js';
	const allFiles = getAllFiles(sourceDir);

	const orderedFiles = allFiles.sort((a, b) => {
		const fileNameA = path.basename(a);
		const fileNameB = path.basename(b);

	// Prioritize util.js over init.js
	if (fileNameA === 'util.js') return -1;
	if (fileNameB === 'util.js') return 1;

	if (fileNameA === 'init.js') return 1;
	if (fileNameB === 'init.js') return -1;

		return fileNameA.length - fileNameB.length
	})

	const concatenatedContents = orderedFiles.map(filePath => {
		return fs.readFileSync(filePath, 'utf8');
	}).join('\n')

	fs.writeFileSync('./public/signup.js', concatenatedContents, 'utf8')
	// end concat JS files

	esbuild.build({
		bundle: false,
		minify: true,
		allowOverwrite: true,
		entryPoints: [`./public/signup.js`],
		outfile: './public/signup.js',
	})
    .then(() => console.log("- signup.js"))
    .catch(() => process.exit(1))
}

const rebuildSignupCSS = () => {
	esbuild.build({
		entryPoints: ['./src/signup/css/main.styl'],
		bundle: true,
		plugins: [stylusLoader()],
		outfile: './public/signup.css',
		minify: true,
		external: ['*.woff2'],
	})
    .then(() => console.log("- signup.css"))
    .catch(() => process.exit(1))
}

//  admin
// --------------------------------------------------------------------------
const rebuildAdminJS = () => {
	// start concat JS files
	function getAllFiles(dir, fileList = []) {
		const files = fs.readdirSync(dir);
		files.forEach(file => {
			const filePath = path.join(dir, file);
			if (fs.statSync(filePath).isDirectory())
				getAllFiles(filePath, fileList);
			else
				fileList.push(filePath);
		});
		return fileList;
	}

	const sourceDir = './src/admin/js';
	const allFiles = getAllFiles(sourceDir);

	const concatenatedContents = allFiles.map(filePath => {
		return fs.readFileSync(filePath, 'utf8');
	}).join('\n')

	fs.writeFileSync('./public/admin.js', concatenatedContents, 'utf8')
	// end concat JS files

	esbuild.build({
		bundle: false,
		minify: true,
		allowOverwrite: true,
		entryPoints: [`./public/admin.js`],
		outfile: './public/admin.js',
	})
    .then(() => console.log("- admin.js"))
    .catch(() => process.exit(1))
}

const rebuildAdminCSS = () => {
	esbuild.build({
		entryPoints: ['./src/admin/css/main.styl'],
		bundle: true,
		plugins: [stylusLoader()],
		outfile: './public/admin.css',
		minify: true,
		external: ['*.woff2'],
	})
    .then(() => console.log("- admin.css"))
    .catch(() => process.exit(1))
}

//  live build
// --------------------------------------------------------------------------
if (process.argv.includes('--live')) {
	async function buildLive() {
		Promise.all([rebuildAdminCSS(), rebuildAdminJS(), rebuildAppCSS(), rebuildAppJS(), rebuildSignupCSS(), rebuildSignupJS()])
			.then(response => console.log('compiling...'))
			.catch(error => console.log(`::Error::<br> ${error}`))
	}
    buildLive()
}

//  dev build
// --------------------------------------------------------------------------
if (process.argv.includes('--dev')) {
	// browser sync connection
	browserSync.init({
		port: 8000,
		ui: {
			port: 8081,
		},
		// move JS inserts to head
		snippetOptions: {
			rule: {
				match: /<\/head>/i,
				fn: (snippet, match) => {
					return snippet + match;
				}
			}
		},
		notify: false
	})

	const watchOptions = {
		ignored: /node_modules/,
		persistent: true,
		awaitWriteFinish: true,
	}

	const watchSignupJS = chokidar.watch(`./src/signup/js/*.js`, watchOptions)
	watchSignupJS.on('ready', rebuildAdminJS)
	watchSignupJS.on('change', () => {
		rebuildSignupJS()
		browserSync.reload('./public/signup.js')
	})

	const watchSignupCSS = chokidar.watch(['./src/signup/css/**/*.styl'], watchOptions)
	watchSignupCSS.on('ready', rebuildAdminCSS)
	watchSignupCSS.on('change', () => {
		rebuildSignupCSS()
		browserSync.reload('./public/signup.css')
	})

	const watchAdminJS = chokidar.watch(`./src/admin/js/*.js`, watchOptions)
	watchAdminJS.on('ready', rebuildAdminJS)
	watchAdminJS.on('change', () => {
		rebuildAdminJS()
		browserSync.reload('./public/admin.js')
	})

	const watchAdminCSS = chokidar.watch(['./src/admin/css/**/*.styl'], watchOptions)
	watchAdminCSS.on('ready', rebuildAdminCSS)
	watchAdminCSS.on('change', () => {
		rebuildAdminCSS()
		browserSync.reload('./public/admin.css')
	})

	const watchAppJS = chokidar.watch(`./src/app/js/**/*.js`, watchOptions)
	watchAppJS.on('ready', rebuildAppJS)
	watchAppJS.on('change', () => {
		rebuildAppJS()
		browserSync.reload('./public/app.js')
	})

	const watchAppCSS = chokidar.watch(['./src/app/css/**/*.styl'], watchOptions)
	watchAppCSS.on('ready', rebuildAppCSS)
	watchAppCSS.on('change', () => {
		rebuildAppCSS()
		browserSync.reload('./public/app.css')
	})
}

process.on('SIGINT', () => {
  watchAppJS.close()
  watchAppCSS.close()
  watchSignupJS.close()
  watchSignupCSS.close()
  watchAdminJS.close()
  watchAdminCSS.close()
  process.exit(0)
})
