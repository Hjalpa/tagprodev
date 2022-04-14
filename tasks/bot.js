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

	// page.on('console', msg => {
	// 	for (let i = 0; i < msg.args().length; i++) {
	// 		console.log(msg.args()[i]);
	// 	}
	// })

	// defualt timeout
	page.setDefaultTimeout(0)
	page.setDefaultNavigationTimeout(0)

	await page.goto('https://tagpro.koalabeast.com/groups')

	await page.setViewport({ width: 1920, height: 1580 })
	await navigationPromise

	// create group
	await page.waitForSelector('#create-group-btn')
	await page.click('#create-group-btn')

	await navigationPromise

	// make group private
	await page.waitForSelector('#pug-btn')
	await page.click('#pug-btn')

	await navigationPromise

	await page.waitForSelector('.js-private-game')

	// write url to console
	console.log(await page.url())

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

	// game settings
	await page.evaluate(() => {
		// group name
		tagpro.group.socket.emit('setting', {
			name: 'groupName',
			value: 'Super League'
		})
		// red team name
		tagpro.group.socket.emit('setting', {
			name: 'redTeamName',
			value: 'anom'
		})
		// blue team name
		tagpro.group.socket.emit('setting', {
			name: 'blueTeamName',
			value: 'nom'
		})
		// time
		tagpro.group.socket.emit('setting', {
			name: 'time',
			value: '7'
		})
		// select map
		tagpro.group.socket.emit('setting', {
			name: 'map',
			value: 'fm_id/74606',
		})
		// self assignment
		tagpro.group.socket.emit('setting', {
			name: 'selfAssignment',
			value: 'false',
		})
		// disable tagpros
		tagpro.group.socket.emit('setting', {
			name: 'powerupTagPro',
			value: 'false',
		})
	})

	// wait for players
	await page.evaluate(() => {
		tagpro.group.socket.on('member', (arg) => {
			if(arg.team === 4) {

				if(arg.name === 'anom') {
					// set team
					tagpro.group.socket.emit('team', {
						id: arg.id,
						team: 1
					})

					// set leader
					tagpro.group.socket.emit('leader', arg.id)
					tagpro.group.socket.emit('chat', `setting new leader: ${arg.name}`)
					tagpro.group.socket.emit('chat', `please ensure players use their proper name!`)
					tagpro.group.socket.emit('chat', '=====================')
					tagpro.group.socket.emit('chat', `injecting tagpro-vcr.js...`)
					tagpro.group.socket.emit('chat', '=====================')
					tagpro.group.socket.emit('chat', 'gl hf!')
				}
				else {
					// move to spectators
					tagpro.group.socket.emit('team', {
						id: arg.id,
						team: 3
					})
				}
				// tagpro.group.socket.emit('chat', `waiting for players ...`)
			}

			// if 4 players
			// tagpro.group.socket.emit('groupPlay')
		})

	})

	// force join game
	await page.waitForSelector('.js-game-in-progress')
	console.log('joining game in progress')
	await page.click('#join-game-btn')
	await navigationPromise

	// wait for game to load
	await page.waitForFunction("window.location.pathname == '/game'")
	await navigationPromise

	console.log('game loaded')

	// import tagpro-vcr.js script
	// await page.addScriptTag({ path: 'tagpro-vcr.js' })
	await page.evaluate(() => {
		var script = document.createElement('script');
		script.setAttribute('src', 'tagpro-vcr.js');
		script.setAttribute('type', 'text/javascript');
		document.getElementsByTagName('head')[0].appendChild(script)
	})

	console.log('tagpro-vcr.js injected')

	// screenshot
	await page.screenshot({ path: '../public/tagpro.png' });

	await page.evaluate(() => {
		tagpro.group.socket.emit('chat', `test 123 cat dog`)
	})

	// await browser.close();
}

createGroup()
