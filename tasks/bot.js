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

	// await page.goto('https://tagpro.koalabeast.com/groups/mywgodnm')
	await page.goto('https://tagpro.koalabeast.com/groups')

	await page.setViewport({ width: 1920, height: 1580 })
	await navigationPromise

	// enter group name
	await page.waitForSelector('input[name="name"]')
	await page.type('input[name="name"]', 'CTF S2W1')

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

	// write url to console
	console.log(await page.url())

	// move Some Ball to spectators
	await page.evaluate(() => {
		let event = new Event('dblclick');
		document.querySelector('#spectators .player-list').dispatchEvent(event)
	})

	// set red team name
	await page.evaluate( () => document.querySelector('input[name="redTeamName"]').value = "")
	await page.type('input[name="redTeamName"]', 'TAG')
	await page.keyboard.press('Enter');

	// set blue team name
	await page.evaluate( () => document.querySelector('input[name="blueTeamName"]').value = "")
	await page.type('input[name="blueTeamName"]', 'COO')
	await page.keyboard.press('Enter');

	// remove self assignment
	await page.evaluate(() => {
		document.querySelector('input[name="selfAssignment"]').checked = false

		let event = new Event('change');
		document.querySelector('input[name="selfAssignment"]').dispatchEvent(event)
	})

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
		// london
		document.querySelector('select[name="server"]').value = 'abb1f9f7c95a'

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
	await page.on('dialog', async dialog => {
		await dialog.accept('74565')
	})
	await page.evaluate(() => {
		document.querySelector('select[name="map"]').value = 'fm_id/'

		let event = new Event('change');
		document.querySelector('select[name="map"]').dispatchEvent(event)
	})

	// disable tagpros
	await page.evaluate(() => {
		document.querySelector('.js-customize').value = 'powerupTagPro'
		document.querySelector('input[name="powerupTagPro"]').checked = false

		let event = new Event('change');
		document.querySelector('input[name="powerupTagPro"]').dispatchEvent(event)
	})
	await page.waitForSelector('.non-default[name="powerupTagPro"]')

	// hand over leader
	await page.waitForFunction(
		'document.querySelector("body").innerText.includes("anom")',
	)
	console.log('anom here')

	await page.waitForSelector('.js-chat-input')
	await page.type('.js-chat-input', '==================')
	await page.keyboard.press('Enter');
	await page.type('.js-chat-input', 'https://tagpro.dev bot')
	await page.keyboard.press('Enter');
	await page.type('.js-chat-input', 'injecting tagpro-vcr.js...')
	await page.keyboard.press('Enter');
	await page.type('.js-chat-input', '==================')
	await page.keyboard.press('Enter');
	await page.type('.js-chat-input', 'anom... you the leader now')
	await page.keyboard.press('Enter');

	// give leader
	await page.evaluate(() => {
		document.querySelector('#waiting .player-item').click()
		document.querySelector('#waiting [data-action="leader"]').click()
	})

	// import tagpro-vcr.js script
	page.addScriptTag({ url: 'tagpro-vcr.js' })

	// screenshot
	await page.screenshot({ path: '../public/tagpro.png' });

	// await browser.close();
}

createGroup()
