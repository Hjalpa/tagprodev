require('dotenv').config({path:__dirname + '/../.env'})

const db = require('../lib/db')

init= (() => {})
init.call = async () => {
	try {

		// fix win
		let raw_win = await db.select(`
			SELECT
				playergame.id,
				playergame.result_half_win,
				playergame.result_half_lose
			FROM playergame
			LEFT JOIN game on playergame.gameid = game.id
			WHERE
				(playergame.team = 1 AND game.winner = 'r' AND redcaps > bluecaps)
				OR
				(playergame.team = 2 AND game.winner = 'b' AND redcaps < bluecaps)
		`, [], 'all')

		for(let playergame of raw_win) {
			playergame.result_half_win = 1
			playergame.result_half_lose = 0

			await db.update('playergame', {
				result_half_win: playergame.result_half_win,
				result_half_lose: playergame.result_half_lose
			}, {id: playergame.id})

			console.log(`win: ${playergame.id}`)
		}

		// fix lose
		let raw_lose = await db.select(`
			SELECT
				playergame.id,
				playergame.result_half_win,
				playergame.result_half_lose
			FROM playergame
			LEFT JOIN game on playergame.gameid = game.id
			WHERE
				(playergame.team = 1 AND game.winner = 'b' AND redcaps < bluecaps)
				OR
				(playergame.team = 2 AND game.winner = 'r' AND redcaps > bluecaps)
		`, [], 'all')

		for(let playergame of raw_lose) {
			playergame.result_half_win = 0
			playergame.result_half_lose = 1

			await db.update('playergame', {
				result_half_win: playergame.result_half_win,
				result_half_lose: playergame.result_half_lose
			}, {id: playergame.id})

			console.log(`lost: ${playergame.id}`)
		}

		// fix tie
		let raw_tie = await db.select(`
			SELECT
				playergame.id,
				playergame.result_half_win,
				playergame.result_half_lose
			FROM playergame
			LEFT JOIN game on playergame.gameid = game.id
			WHERE
				redcaps = bluecaps
		`, [], 'all')

		for(let playergame of raw_tie) {
			playergame.result_half_win = 0
			playergame.result_half_lose = 0

			await db.update('playergame', {
				result_half_win: playergame.result_half_win,
				result_half_lose: playergame.result_half_lose
			}, {id: playergame.id})

			console.log(`tie: ${playergame.id}`)
		}

		console.log('---------------')
		console.log('finished')
	}

	catch(e) {
		console.log(e)
	}

	finally {
		process.kill(process.pid)
	}
}

init.call()
