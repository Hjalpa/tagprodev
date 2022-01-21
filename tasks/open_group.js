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

	// await page.goto('https://tagpro-maptest-paris.koalabeast.com/groups')
	// await page.goto('https://tagpro.koalabeast.com/groups/mywgodnm')
	await page.goto('https://tagpro.koalabeast.com/groups')

	await page.setViewport({ width: 1920, height: 1580 })
	await navigationPromise

	// enter group name
	await page.waitForSelector('input[name="name"]')
	await page.type('input[name="name"]', 'Super League Game')

	// create group
	await page.click('#create-group-btn')

	await page.waitForSelector('input[name="redTeamName"]')
	await page.type('input[name="redTeamName"]', 'wat')

	await navigationPromise

	// make group private
	await page.waitForSelector('#pug-btn')
	await page.click('#pug-btn')


	await navigationPromise


	await page.waitForSelector('.js-private-game')

	console.log(await page.url())


	await page.waitForSelector('.js-chat-input')
	await page.type('.js-chat-input', '==================')
	await page.keyboard.press('Enter');
	await page.type('.js-chat-input', 'https://tagpro.dev bot')
	await page.keyboard.press('Enter');
	await page.type('.js-chat-input', 'injecting tagpro-vcr.js...')
	await page.keyboard.press('Enter');
	await page.type('.js-chat-input', '==================')
	await page.keyboard.press('Enter');
	// await page.addScriptTag({ url: 'tagpro-vcr.js' })

	// set red team name
	await page.evaluate( () => document.querySelector('input[name="redTeamName"]').value = "")
	await page.type('input[name="redTeamName"]', 'TAG')
	await page.keyboard.press('Enter');

	// set blue team name
	await page.evaluate( () => document.querySelector('input[name="blueTeamName"]').value = "")
	await page.type('input[name="blueTeamName"]', 'COO')
	await page.keyboard.press('Enter');


	// set comp mode
	await page.evaluate(() => {
		document.querySelector('input[name="competitiveSettings"]').checked = true

		let event = new Event('change');
		document.querySelector('input[name="competitiveSettings"]').dispatchEvent(event)
	})


	// set server
	await page.evaluate(() => {
		document.querySelector('.js-toggle-server-select').click()
	})
	await page.waitForSelector('.server-settings', {visible: true})
	await page.evaluate(() => {
		document.querySelector('select[name="server"]').value = '18206d564c0d'

		let event = new Event('change');
		document.querySelector('select[name="server"]').dispatchEvent(event)
	})

	// time
	await page.evaluate(() => {
		document.querySelector('select[name="time"]').value = '7'

		let event = new Event('change');
		document.querySelector('select[name="time"]').dispatchEvent(event)
	})

	// select map
	await page.evaluate(() => {
		document.querySelector('select[name="map"]').value = 'um_id/'

		let event = new Event('change');
		document.querySelector('select[name="map"]').dispatchEvent(event)


	})
	await page.on('dialog', async dialog => {

        console.log( dialog.type() );

        console.log( dialog.message() );

        await dialog.accept( "85836" );

		// await page.dialog.type('prompt', '85836')

	})

	await page.keypress('enter')

	// disable tagpros
	await page.evaluate(() => {
		document.querySelector('.js-customize').value = 'powerupTagPro'
		document.querySelector('input[name="powerupTagPro"]').checked = false

		let event = new Event('change');
		document.querySelector('input[name="powerupTagPro"]').dispatchEvent(event)
	})



	await page.waitForSelector('.non-default[name="powerupTagPro"]')


	// screenshot
	await page.screenshot({ path: '../public/tagpro.png' });



	// await browser.close();
}

createGroup()
