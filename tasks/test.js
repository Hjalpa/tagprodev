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
	// page.on("console", (consoleObj) => console.log(consoleObj));
	 page.on('console', msg => {
		for (let i = 0; i < msg.args().length; i++) {
			console.log(msg.args()[i]);
		}
	});

	const navigationPromise = page.waitForNavigation()

	// defualt timeout
	page.setDefaultNavigationTimeout(0)

	// await page.goto('https://tagpro.koalabeast.com/groups/mywgodnm')
	await page.goto('https://tagpro.koalabeast.com')

	await page.setViewport({ width: 1920, height: 1580 })
	await navigationPromise

	// await page.waitForFunction(() => typeof gObject === tagpro);
	// console.log(await page.evaluate(() => tagpro))

	await page.evaluate(() => {
		console.log(tagpro.version)
	})

	// screenshot
	await page.screenshot({ path: '../public/tagpro.png' });

	// await browser.close();
}

createGroup()
