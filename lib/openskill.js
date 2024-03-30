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
						pg.saveattempt,
						pg.flair,
						pg.score,
						pg.gameid

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

						// defaults
						const { mu, sigma } = rating()
						player.mu = mu
						player.sigma = sigma

						// if player has winrate flair
						if(player.flair != null && player.flair.className.includes('winRate')) {
							let winrate = await getAverageFromWinrateFlair(player.flair.className)
							player.mu = winrate.mu
							player.sigma = winrate.sigma
						}

						// if player has degrees
						else if(player.degree >= 100) {
							let degree = await getAverageFromDegree(player.degree)
							if(degree.openskill != null) {
								player.mu = degree.mu
								player.sigma = degree.sigma
							}
						}

						// compare score on map to get average
						else if(player.score != null) {
							let score = await getAverageFromScore(player.score, player.gameid, player.duration)
							if(score.openskill != null) {
								player.mu = score.mu
								player.sigma = score.sigma
							}
						}

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
					// if(player.multiuser) {
					// 	const { mu, sigma } = rating()
					// 	player.mu = mu
					// 	player.sigma = sigma
					// }

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

			async function getAverageFromWinrateFlair(flair) {
				return await db.select(`
					SELECT
						AVG(openskill) as openskill,
						AVG(mu) as mu,
						AVG(sigma) as sigma
					FROM (
						SELECT
							tp_player.name,
							tp_playergame.openskill,
							tp_playergame.mu,
							tp_playergame.sigma,
							tp_playergame.flair,
							(SELECT count(*) FROM tp_playergame WHERE playerid = tp_player.id) AS games
						FROM
							tp_player
						LEFT JOIN
							(SELECT
								playerid,
								openskill,
								mu,
								sigma,
								flair,
								ROW_NUMBER() OVER (PARTITION BY playerid ORDER BY datetime DESC) AS row_num
							FROM
								tp_playergame) AS tp_playergame ON tp_player.id = tp_playergame.playerid
						WHERE
							tp_player.multiuser IS FALSE
							AND tp_player.tpid IS NOT NULL
							AND tp_playergame.row_num = 1
							AND (SELECT count(*) FROM tp_playergame WHERE playerid = tp_player.id) > 300
							AND tp_playergame.flair->>'className' = $1
					) AS subquery
				`, [flair], 'row')
			}

			async function getAverageFromDegree(degree) {
				let min = degree - 15
				let max = degree + 15
				return await db.select(`
					SELECT
						AVG(openskill) as openskill,
						AVG(mu) as mu,
						AVG(sigma) as sigma
					FROM (
						SELECT
							tp_player.name,
							tp_playergame.openskill,
							tp_playergame.mu,
							tp_playergame.sigma,
							tp_playergame.degree,
							(SELECT count(*) FROM tp_playergame WHERE playerid = tp_player.id) AS games
						FROM
							tp_player
						LEFT JOIN
							(SELECT
								playerid,
								openskill,
								mu,
								sigma,
								degree,
								ROW_NUMBER() OVER (PARTITION BY playerid ORDER BY datetime DESC) AS row_num
							FROM
								tp_playergame) AS tp_playergame ON tp_player.id = tp_playergame.playerid
						WHERE
							tp_player.multiuser IS FALSE
							AND tp_player.tpid IS NOT NULL
							AND tp_playergame.row_num = 1
							AND (SELECT count(*) FROM tp_playergame WHERE playerid = tp_player.id) > 300
							AND tp_playergame.degree >= $1 AND tp_playergame.degree <= $2
					) AS subquery
				`, [min, max], 'row')
			}

			async function getAverageFromScore(score, gameid, duration) {
				return await db.select(`
					SELECT
						AVG(openskill) AS openskill,
						AVG(mu) AS mu,
						AVG(sigma) AS sigma
					FROM (
						select tp_map.name, tp_playergame.gameid, tp_playergame.playerid, tp_playergame.mu, tp_playergame.sigma, tp_playergame.openskill, tp_playergame.flair, tp_playergame.score, tp_playergame.duration
						from public.tp_playergame
						left join tp_game on tp_game.id = tp_playergame.gameid
						left join tp_map on tp_map.id = tp_game.mapid
						left join tp_player on tp_Player.id = tp_playergame.playerid
						where gameid = $2 AND openskill IS NOT NULL AND tp_player.tpid IS NOT NULL AND tp_playergame.duration <= $3
						order by ABS(score - $1)
						LIMIT 100
					) as subquery
				`, [score, gameid, duration], 'row')
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
