const db = require('../lib/db')
const { rating, rate, ordinal, predictWin } = require('openskill')

const openskill = {

	rank: async gameid => {
		try {
			let games = await db.select('SELECT * FROM tp_game WHERE id = $1', [gameid], 'all')

			for await (const game of games) {
				let playerData = await db.select(`
					SELECT
						tp_player.id as playerid,
						tp_player.mu, tp_player.sigma,
						tp_playergame.winner,
						tp_playergame.team,
						tp_playergame.finished,
						tp_playergame.duration
					FROM tp_playergame
					LEFT JOIN tp_player on tp_player.id = tp_playergame.playerid
					WHERE gameid = $1
				`, [game.id], 'all')

				// set default if not exist
				for(const player of playerData)
					if(player.mu == null && player.sigma == null)  {
						const { mu, sigma } = rating()
						player.mu = mu
						player.sigma = sigma
					}

				const organizedTeams = {}
				playerData.forEach(async match => {
					const team = match.team

					// if player did not finish prevent them from being added
					if(!match.finished) {
						await playerQuit(match, gameid)
						return false
					}

					if (!organizedTeams[team])
						organizedTeams[team] = []

					organizedTeams[team].push({
						playerid: match.playerid,
						mu: match.mu,
						sigma: match.sigma,
						winner: match.winner,
						team: match.team,
						duration: match.duration,
						finished: match.finished
					})
				})

				const sorted = Object.values(organizedTeams).sort((a, b) => b[0].winner - a[0].winner)

				const playerRating = rate(sorted)
				const result = mergeArrays(sorted, playerRating).flat()
				for(let player of result) {
					let rank = ordinal({mu: player.mu, sigma: player.sigma})

					// save openskill per game
					await db.update('tp_playergame', {
						playerid: player.playerid,
						gameid: game.id,
						mu: player.mu,
						openskill: rank,
						sigma: player.sigma,
					}, {
						playerid: player.playerid,
						gameid: game.id
					})

					// // save openskill per player
					await db.update('tp_player', {
						id: player.playerid,
						mu: player.mu,
						openskill: rank,
						sigma: player.sigma,
					}, {
						id: player.playerid
					})
				}

				// insert prediction
				const rawPrediction = predictWin(sorted)
				let prediction = {
					'red': (sorted[0][0].team === 1 ? rawPrediction[0] : rawPrediction[1]),
					'blue': (sorted[1][0].team === 2 ? rawPrediction[1] : rawPrediction[0])
				}
				await db.update('tp_game', {prediction}, {id: gameid})
			}

			function mergeArrays(existingValues, newValues) {
				for (let i = 0; i < existingValues.length; i++) {
					const team = existingValues[i]
					for (let j = 0; j < team.length; j++) {
						const match = team[j]
						match.mu = newValues[i][j].mu
						match.sigma = newValues[i][j].sigma
					}
				}
				return existingValues
			}

			async function playerQuit(playerData, gameid) {
				let raw = [[playerData],[playerData]]
				let playerRating = rate(raw)

				playerData.mu = playerRating[1][0].mu
				playerData.sigma = playerRating[1][0].sigma
				playerData.openskill = ordinal({mu: playerData.mu, sigma: playerData.sigma})

				// save openskill per game
				await db.update('tp_playergame', {
					playerid: playerData.playerid,
					gameid: gameid,
					mu: playerData.mu,
					openskill: playerData.openskill,
					sigma: playerData.sigma,
				}, {
					playerid: playerData.playerid,
					gameid: gameid
				})

				// // save openskill per player
				await db.update('tp_player', {
					id: playerData.playerid,
					mu: playerData.mu,
					openskill: playerData.openskill,
					sigma: playerData.sigma,
				}, {
					id: playerData.playerid
				})

			}
		}

		catch(e) {
			console.log(e)
		}

		finally {
			return true
			// process.kill(process.pid)
		}
	}

}

module.exports = openskill
