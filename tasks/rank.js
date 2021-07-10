process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
require('dotenv').config({path:__dirname + '/../.env'})

const db = require('../lib/db')
const util = require('../lib/util')
const { rating, rate, ordinal } = require('openskill')

score = (() => {})
score.call = async () => {
	try {

		let players = await db.select('SELECT * FROM playerskill', [], 'all')
		for await (const p of players) {
			let rank = ordinal({mu: p.mu, sigma: p.sigma})
			await db.update('playerskill', {rank:rank}, {playerid: p.playerid})
			console.log(p.playerid)
		}

		process.kill(process.pid)
	} catch(e) {
		console.log('ERROR: ' + e)
		process.kill(process.pid)
	}
}
score.call()
