process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
require('dotenv').config({path:__dirname + '/../.env'})

const db = require('../lib/db')
const util = require('../lib/util')
const { rating, rate, ordinal } = require('openskill')

score = (() => {})
score.call = async () => {
	try {

		let games = await db.select('SELECT * FROM game ORDER BY euid ASC', [], 'all')
		for await (const game of games) {
			console.log(game.id+ 'started')
			let playerData = await db.select('SELECT * FROM playergame WHERE gameid = $1', [game.id], 'all')

			let players = [[],[]]
			let raw = [[],[]]

			for await (const p of playerData) {
				let playerSkill = await db.select(`SELECT * from playerskill WHERE playerid = $1`, [p.playerid], 'row')

				//let win = (p.result_half_win === 1) ? 0 : 1
				let win = ((game.winner === 'r' && p.team === 1) || (game.winner === 'b' && p.team === 2)) ? 0 : 1


				players[win].push({ playerid: p.playerid, skill: false })

				raw[win].push((playerSkill) ? {mu: playerSkill.mu, sigma: playerSkill.sigma} : rating())
			}


			// get truescore
			[
				[
					players[0][0].skill,
					players[0][1].skill,
					players[0][2].skill,
					players[0][3].skill
				], [
					players[1][0].skill,
					players[1][1].skill,
					players[1][2].skill,
					players[1][3].skill
				]
			] = rate([raw[0], raw[1]])



			await db.insertUpdate('playerskill', {playerid: players[0][0].playerid, mu: players[0][0].skill.mu, sigma: players[0][0].skill.sigma}, ['playerid'])
			await db.insertUpdate('playerskill', {playerid: players[0][1].playerid, mu: players[0][1].skill.mu, sigma: players[0][1].skill.sigma}, ['playerid'])
			await db.insertUpdate('playerskill', {playerid: players[0][2].playerid, mu: players[0][2].skill.mu, sigma: players[0][2].skill.sigma}, ['playerid'])
			await db.insertUpdate('playerskill', {playerid: players[0][3].playerid, mu: players[0][3].skill.mu, sigma: players[0][3].skill.sigma}, ['playerid'])
			await db.insertUpdate('playerskill', {playerid: players[1][0].playerid, mu: players[1][0].skill.mu, sigma: players[1][0].skill.sigma}, ['playerid'])
			await db.insertUpdate('playerskill', {playerid: players[1][1].playerid, mu: players[1][1].skill.mu, sigma: players[1][1].skill.sigma}, ['playerid'])
			await db.insertUpdate('playerskill', {playerid: players[1][2].playerid, mu: players[1][2].skill.mu, sigma: players[1][2].skill.sigma}, ['playerid'])
			await db.insertUpdate('playerskill', {playerid: players[1][3].playerid, mu: players[1][3].skill.mu, sigma: players[1][3].skill.sigma}, ['playerid'])

			console.log(game.id + 'ended')
		}

		process.kill(process.pid)

	} catch(e) {
		console.log('ERROR: ' + e)
		db.insert('errorlog', {error: e, raw: {}, euid: false})
		process.kill(process.pid)
	}
}
score.call()
