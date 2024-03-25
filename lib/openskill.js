const db = require('../lib/db')
const { rating, rate, ordinal, predictWin } = require('openskill')

const openskill = {

	rank: async gameid => {
		try {
			let games = await db.select('SELECT * FROM tp_game WHERE id = $1', [gameid], 'all')

			for await (const game of games) {
				let playerData = await db.select(`
					SELECT
						pg.playerid as playerid,
						(select multiuser from tp_player where id = pg.playerid) as multiuser,
						pg.winner,
						pg.team,
						pg.finished,
						pg.duration,
						pg.datetime,
						(select openskill from tp_playergame where playerid = pg.playerid AND datetime < pg.datetime order by datetime desc limit 1) as openskill,
						(select mu from tp_playergame where playerid = pg.playerid AND datetime < pg.datetime order by datetime desc limit 1) as mu,
						(select sigma from tp_playergame where playerid = pg.playerid AND datetime < pg.datetime order by datetime desc limit 1) as sigma,
						pg.saveattempt

					FROM tp_playergame as pg
					WHERE gameid = $1
				`, [game.id], 'all')

				// set default if not exist
				for(const player of playerData) {
					if(player.mu == null && player.sigma == null)  {
						const { mu, sigma } = rating()
						player.mu = mu
						player.sigma = sigma
					}

					// set defaults for Some Balls and Mutes
					if(player.multiuser) {
						const { mu, sigma } = rating()
						player.mu = mu
						player.sigma = sigma
					}
				}

				const organizedTeams = {}
				playerData.forEach(async match => {
					const team = match.team

					// if failed save attempt
					if(match.saveattempt && !match.winner) {
						await failedSaveAttempt(match, gameid)
						return false
					}

					// if player did not finish prevent them from being added
					else if(!match.finished) {
						await playerQuit(match, gameid, playerData)
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
						finished: match.finished,
						multiuser: match.multiuser,
					})
				})

				// rate players
				const sorted = Object.values(organizedTeams).sort((a, b) => b[0].winner - a[0].winner)
				const playerRating = rate(sorted)
				const result = mergeArrays(sorted, playerRating).flat()

				// save openskill per game
				for(let player of result) {

					// overwrite: set defaults for Some Balls and Mutes
					if(player.multiuser) {
						const { mu, sigma } = rating()
						player.mu = mu
						player.sigma = sigma
					}

					await db.update('tp_playergame', {
						playerid: player.playerid,
						gameid: game.id,
						mu: player.mu,
						sigma: player.sigma,
						openskill: ordinal({mu: player.mu, sigma: player.sigma})
					}, {
						playerid: player.playerid,
						gameid: game.id
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

			async function playerQuit(playerData, gameid, matchData) {

				function getTop4ArraysByDuration(team, data) {
					// Filter data for the specific team
					const teamData = data.filter(item => item.team === team)
					// Sort the teamData array based on duration in descending order
					teamData.sort((a, b) => b.duration - a.duration)
					// Slice the top 4 arrays
					const top4Arrays = teamData.slice(0, 4)

					return top4Arrays
				}

				function isPlayerFound(playerIdToCheck, data) {
					for (const team of data)
						for (const player of team)
							if (player.playerid === playerIdToCheck)
								return true
					return false
				}

				const reds = getTop4ArraysByDuration(1, matchData)
				const blues = getTop4ArraysByDuration(2, matchData)

				// ensure the quit player is included. Remove the lowest ranked player from top 4 duration if necessary.
				const playerExists = isPlayerFound(playerData.playerid, [reds, blues])
				if(!playerExists) {
					if(playerData.team === 1)
						reds[reds.length - 1] = playerData
					else if (playerData.team === 2)
						blues[blues.length - 1] = playerData
				}

				// force quit player to lose
				let raw = playerData.team === 2 ? [reds,blues] : [blues,reds]

				// update player ranking
				let ratings = rate(raw)

				let index = playerData.team === 1 ? reds.findIndex(obj => obj.playerid === playerData.playerid) : blues.findIndex(obj => obj.playerid === playerData.playerid)
				let playerRating = ratings[1][index]

				// if the user switched we can safely ignore them
				if(index === -1)
					return false

				playerData.mu = playerRating.mu
				playerData.sigma = playerRating.sigma
				playerData.openskill = ordinal({mu: playerData.mu, sigma: playerData.sigma})

				// save openskill per game
				await db.update('tp_playergame', {
					playerid: playerData.playerid,
					gameid: gameid,
					mu: playerData.mu,
					sigma: playerData.sigma,
					openskill: playerData.openskill,
				}, {
					playerid: playerData.playerid,
					gameid: gameid
				})
			}

			async function failedSaveAttempt(playerData, gameid) {
				let raw = [[playerData],[playerData]]

				// assume user is new and lost their first game as a failed save attempt. we need to set the default openskill value
				if(playerData.openskill === null || !playerData.openskill)
					playerData.openskill = 0

				// save openskill per game
				await db.update('tp_playergame', {
					playerid: playerData.playerid,
					gameid: gameid,
					mu: playerData.mu,
					sigma: playerData.sigma,
					openskill: playerData.openskill,
				}, {
					playerid: playerData.playerid,
					gameid: gameid
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
