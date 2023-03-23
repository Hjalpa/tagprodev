const axios = require('axios')
const jsdom = require('jsdom')
const chrono = require('chrono-node');

const exec = require('child_process').exec
const db = require ('../lib/db')
const util = require ('../lib/util')

module.exports.generate = async (req, res) => {
	try {
		let spies = await db.query("SELECT tpid, name FROM spy WHERE lastseendate > now() - interval '100' day ORDER BY lastseendate DESC", 'all')
		for(let player in spies) {
			let p = spies[player]
			await axios.post(`https://tagpro.dev/api/spy/update`, {
				tpid: p.tpid
			})
			console.log(`spying on ${p.name}`)
		}
		res.send('spy complete')
	} catch(e) {
		res.status(400).json({error: e})
	}
}

module.exports.list = async (req, res) => {
	try {
		let data = {
			config: {
				title: '🕵️',
				name:  'EU Activity',
				path: req.baseUrl,
				season: req.season,
				nav: {
					cat: 'spy',
					page: 'overview'
				}
			},
			players: await getPlayers(),
		}
		res.render('spy', data);
	} catch(e) {
		res.status(400).json({error: e})
	}
}

async function getPlayers() {
	let raw = await db.select(`
		SELECT
			flair,
			name,
			tpid,
			lastseen as "last seen",
			flairwinrate as "F.WR",
			r300,
			degrees,

			CASE WHEN ( (EXTRACT(EPOCH FROM current_timestamp) - EXTRACT(EPOCH FROM lastseendate))/3600) < 0.35 THEN 'true' ELSE 'false' END as online,

			gamestoday as "2day.g",
			winratetoday as "2day.wr%",

			gamesweek as "wk.g",
			winrateweek as "wk.wr%",

			gamesmonth as "mo.g",
			winratemonth as "mo.wr%",

			gamesall as "all.g",
			winrateall as "all.wr%",

			flaircount as flairs,

			accountage as age

		FROM spy
		ORDER BY lastseendate DESC, gamestoday DESC
	`, [], 'all')

	for(id in raw)
		raw[id].age = util.displayDate(raw[id].age)

	return raw
}

module.exports.player = async (req, res) => {
	if(req.body.tpid)
		await grabPlayer(req.body.tpid)

	return res.json({'complete':true})
}

async function grabPlayer(tpid) {
	let playerExists = await db.select('SELECT id FROM spy WHERE tpid = $1', [tpid], 'id')
	if(!playerExists) {
		try {
			const dom = await getProfile(`https://tagpro.koalabeast.com/profile/${tpid}`)

			let player = {
				tpid,
				name: await getName(dom),
				accountAge: await getAccountAge(dom),
				lastSeen: await getLastSeen(dom),
				degrees: await getDegrees(dom),
				nextDegreeIn: await getNextDegreeIn(dom),
				r300: await getR300(dom),

				flair: await getFlair(dom),
				flairCount: await getFlairCount(dom),
				flairWinrate: await getFlairWinrate(dom),

				gamesToday: await getGamesToday(dom),
				winrateToday: await getWinrateToday(dom),

				gamesWeek: await getGamesWeek(dom),
				winrateWeek: await getWinrateWeek(dom),

				gamesMonth: await getGamesMonth(dom),
				winrateMonth: await getWinrateMonth(dom),

				gamesAll: await getGamesAll(dom),
				winrateAll: await getWinrateAll(dom),

				timeplayedAll: await getTimeplayedAll(dom),
			}

			player.lastSeenDate = chrono.parseDate(player.lastSeen)
			player.accountAge = chrono.parseDate(player.accountAge)

			await db.insert('spy', player)
			console.log(`spying on ${player.name}`)
		}
		catch(error) {
			console.log(error)
		}
	}
}

module.exports.update = async (req, res) => {
	if(req.body.tpid)
		await updatePlayer(req.body.tpid)

	return res.json({'complete':true})
}

async function updatePlayer(tpid) {
	let playerExists = await db.select('SELECT id, name FROM spy WHERE tpid = $1', [tpid], 'row')
	if(playerExists) {
		try {
			const dom = await getProfile(`https://tagpro.koalabeast.com/profile/${tpid}`)

			let player = {
				tpid,
				lastSeen: await getLastSeen(dom),
				degrees: await getDegrees(dom),
				nextDegreeIn: await getNextDegreeIn(dom),
				r300: await getR300(dom),
				flair: await getFlair(dom),
				flairCount: await getFlairCount(dom),
				flairWinrate: await getFlairWinrate(dom),

				gamesToday: await getGamesToday(dom),
				winrateToday: await getWinrateToday(dom),

				gamesWeek: await getGamesWeek(dom),
				winrateWeek: await getWinrateWeek(dom),

				gamesMonth: await getGamesMonth(dom),
				winrateMonth: await getWinrateMonth(dom),

				gamesAll: await getGamesAll(dom),
				winrateAll: await getWinrateAll(dom),

				timeplayedAll: await getTimeplayedAll(dom),
			}

			player.lastSeenDate = chrono.parseDate(player.lastSeen)

			await db.update('spy', player, {tpid: player.tpid})
			console.log(`spy updated ${player.tpid}`)

			// add entry into spysmurf if name doesn't match
			let smurf = {
				spyid: playerExists.id,
				name: await getName(dom),
				flair: player.flair,
			}
			if(smurf.name != playerExists.name) {
				console.log(`new name found for ${playerExists.name}: ${smurf.name}`)
				await db.insertUpdate('spysmurf', smurf, ['spyid', 'name'])
			}
		}
		catch(error) {
			console.log(error)
		}
	}
}

async function getProfile(profile) {
	let raw = await axios.get(profile)
	raw.headers['content-type']
	return await new jsdom.JSDOM(raw.data)
}

async function getName(dom) {
	let username = dom.window.document.querySelector('.profile-name')
	if(!username)
		throw 'bad profile URL'
	if(username) username = username.textContent.trim()
	return username
}

async function getFlair(dom) {
	let raw = dom.window.document.querySelector('#owned-flair .flair-available.selected .flair-header')
	return raw.textContent.trim()
}

async function getR300(dom) {
	let raw = dom.window.document.querySelector('#rolling table tbody tr:first-child td:nth-of-type(2)')
	if(raw.textContent.trim() === '–')
		return parseFloat(0)
	else
		return parseFloat(raw.textContent.trim())
}

async function getAccountAge(dom) {
	let raw = dom.window.document.querySelector('.profile-detail table tbody tr:first-child td:nth-of-type(2) span')
	return new Date(raw.getAttribute('title').trim()).toISOString()
}

async function getLastSeen(dom) {
	let raw = dom.window.document.querySelector('.profile-detail table tbody tr:nth-of-type(2) td:nth-of-type(2)')
	return raw.textContent.trim()
}

async function getDegrees(dom) {
	let raw = dom.window.document.querySelector('.profile-detail table tbody tr:nth-of-type(3) td:nth-of-type(2)')
	return parseInt(raw.textContent.trim())
}

async function getNextDegreeIn(dom) {
	let raw = dom.window.document.querySelector('.profile-detail table tbody tr:nth-of-type(4) td:nth-of-type(2)')
	if(raw.textContent.trim() === 'next win')
		return 1
	else
		return parseInt(raw.textContent.match(/\d+/)[0])
}

async function getFlairCount(dom) {
	let raw = dom.window.document.querySelectorAll('#owned-flair li.flair-available')
	return raw.length - 1
}

async function getFlairWinrate(dom) {
	if(dom.window.document.querySelector('#all-flair li.flair-available .winRate-insane') != null)
		return 3
	else if(dom.window.document.querySelector('#all-flair li.flair-available .winRate-awesome') != null)
		return 2
	else if(dom.window.document.querySelector('#all-flair li.flair-available .winRate-good') != null)
		return 1
	else
		return 0
}




async function getGamesToday(dom) {
	let raw = dom.window.document.querySelector('#all-stats tbody tr:nth-of-type(3) td:nth-of-type(2)')
	return parseInt(raw.textContent.trim())
}

async function getGamesWeek(dom) {
	let raw = dom.window.document.querySelector('#all-stats tbody tr:nth-of-type(3) td:nth-of-type(3)')
	return parseInt(raw.textContent.trim())
}

async function getGamesMonth(dom) {
	let raw = dom.window.document.querySelector('#all-stats tbody tr:nth-of-type(3) td:nth-of-type(4)')
	return parseInt(raw.textContent.trim())
}

async function getGamesAll(dom) {
	let raw = dom.window.document.querySelector('#all-stats tbody tr:nth-of-type(3) td:nth-of-type(5)')
	return parseInt(raw.textContent.trim())
}






async function getWinrateToday(dom) {
	let raw = dom.window.document.querySelector('#all-stats tbody tr:nth-of-type(1) td:nth-of-type(2)')
	if(raw.textContent.trim() === '–')
		return parseFloat(0)
	else
		return parseFloat(raw.textContent.trim())
}

async function getWinrateWeek(dom) {
	let raw = dom.window.document.querySelector('#all-stats tbody tr:nth-of-type(1) td:nth-of-type(3)')
	if(raw.textContent.trim() === '–')
		return parseFloat(0)
	else
		return parseFloat(raw.textContent.trim())
}

async function getWinrateMonth(dom) {
	let raw = dom.window.document.querySelector('#all-stats tbody tr:nth-of-type(1) td:nth-of-type(4)')
	if(raw.textContent.trim() === '–')
		return parseFloat(0)
	else
		return parseFloat(raw.textContent.trim())
}

async function getWinrateAll(dom) {
	let raw = dom.window.document.querySelector('#all-stats tbody tr:nth-of-type(1) td:nth-of-type(5)')
	if(raw.textContent.trim() === '–')
		return parseFloat(0)
	else {
		let saves = parseInt(dom.window.document.querySelector('#all-stats tbody tr:nth-of-type(7) td:nth-of-type(5)').textContent.trim())
		if(isNaN(saves)) saves = 0

		let saveAttemptPercentage = parseInt(dom.window.document.querySelector('#all-stats tbody tr:nth-of-type(8) td:nth-of-type(5)').textContent.trim())
		if(isNaN(saveAttemptPercentage)) saveAttemptPercentage = 0

		let saveattempts = 0
		if(saves === 0 && saveAttemptPercentage === 0)
			saveattempts = 0
		else if(!isNaN(parseFloat(saveAttemptPercentage)))
			saveattempts = Math.round((saves / saveAttemptPercentage) * 100)

		let ties = parseInt(dom.window.document.querySelector('#all-stats tbody tr:nth-of-type(5) td:nth-of-type(5)').textContent.trim())
		if(isNaN(ties)) ties = 0

		let disconnects = parseInt(dom.window.document.querySelector('#all-stats tbody tr:nth-of-type(21) td:nth-of-type(5)').textContent.trim())
		if(isNaN(disconnects)) disconnects = 0

		let games = parseInt(dom.window.document.querySelector('#all-stats tbody tr:nth-of-type(3) td:nth-of-type(5)').textContent.trim()) - saveattempts - ties - disconnects
		if(isNaN(games)) games = 0

		let wins = parseInt(dom.window.document.querySelector('#all-stats tbody tr:nth-of-type(4) td:nth-of-type(5)').textContent.trim())
		if(isNaN(wins)) wins = 0

		return ((wins / games) * 100).toFixed(2)
	}
}

async function getTimeplayedAll(dom) {
	let raw = dom.window.document.querySelector('#all-stats tbody tr:nth-of-type(20) td:nth-of-type(5)')

	let str = raw.textContent.trim()

	const [hours, minutes, seconds] = str.split(':');

	function convertToSeconds(hours, minutes, seconds) {
		return Number(hours) * 60 * 60 + Number(minutes) * 60 + Number(seconds);
	}

	return convertToSeconds(hours, minutes, seconds)
}
