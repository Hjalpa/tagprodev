const puppeteer = require('puppeteer');

const config = {
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
    ],
	headless: true,
    devtools: false,
    //slowMo: 200,
}

const createGroup = async () => {
    const browser = await puppeteer.launch(config);
    const page = await browser.newPage();
	const navigationPromise = page.waitForNavigation()

	// defualt timeout
	page.setDefaultNavigationTimeout(0)

	// await page.goto('https://tagpro.koalabeast.com/groups/mywgodnm')
	await page.goto('https://tagpro.koalabeast.com')

	await page.setViewport({ width: 1920, height: 1580 })
	await navigationPromise

	// import tagpro-vcr.js script
	await page.addScriptTag({ path: 'tagpro-vcr.js' })

	// wait for #nav-vcr a
	await page.waitForSelector('#nav-vcr')

	// set server
	// await page.evaluate(() => {
	// 	document.querySelector('#nav-vcr a').click()
	// })
	await page.click('#nav-vcr a')

	await navigationPromise

	console.log('after nav-vcr a click')


	await page.evaluate(() => {
		let event = new Event('click');
		document.querySelector('#nav-vcr').dispatchEvent(event)
	})

	// await page.waitForSelector('.vcr-list')
	// console.log('after vcr-list')

	// screenshot
	await page.screenshot({ path: '../public/tagpro.png' });

	// await browser.close();
}

createGroup()
