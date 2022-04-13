const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {

	try {
		let data = {
			config: {
				title: req.player.name + ' profile',
				player: req.player.name,
				path: req.baseUrl,
				nav: {
					cat: 'players',
					page: 'overview',
				}
			},
			seasons: await getSeasonCount(req.player.id),
			winratio: await getWinRatio(req.player.id),
			cost: await getAverageCost(req.player.id),
			openskill: await getOpenSkill(req.player.id),
			///////////
			topseasons: await getTopSeasons(req.player.id),
			topmaps: await getTopMaps(req.player.id),
			topteammates: await getTopTeammates(req.player.id),
		}

		res.render('player-dash', data)
	}
	catch(e) {
		res.status(400).json({error: e})
	}
}

async function getOpenSkill(playerid) {
	let raw = await db.select(`
		SELECT
			rank
		FROM playerskill
		WHERE playerid = $1
	`, [playerid], 'rank')
	return parseFloat(raw).toFixed(2)
}

async function getAverageCost(playerid) {
	let raw = await db.select(`
		SELECT
			Round(avg(cost), 2) as cost
		FROM seasonplayer
		WHERE playerid = $1 AND captain = FALSE
		GROUP BY playerid
	`, [playerid], 'cost')

	// if only played as a captain
	if(!raw) raw = '-'

	return raw
}

async function getSeasonCount(playerid) {
	let raw = await db.select(`
		SELECT
			count(*) as total
		FROM seasonplayer
		WHERE playerid = $1
		GROUP BY playerid
	`, [playerid], 'total')
	return raw
}

async function getWinRatio(playerid) {
	let raw = await db.select(`
		SELECT
		ROUND(
			(
				count(*) filter (WHERE result_half_win = 1)
				/
				count(*)::DECIMAL
			)
			* 100
		, 0) || '%' as winrate
		FROM playergame
		WHERE playerid = $1
		GROUP BY playerid
	`, [playerid], 'winrate')
	return raw
}

async function getTopMaps(player) {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY
				-- (count(*) filter (WHERE result_half_win = 1) / count(*)::DECIMAL) DESC


				ROUND(
					(
						count(*) filter (WHERE result_half_win = 1)
						/
						count(*)::DECIMAL
					) * 100
				, 2) DESC


			) rank,

			map.name as map,
			unfortunateid,
			count(*) as played,
			TO_CHAR( sum(play_time) * interval '1 sec', 'hh24:mi:ss') as time,
			ROUND(
				(sum(cap_team_for)::DECIMAL - sum(cap_team_against)::DECIMAL)::DECIMAL / (sum(play_time) / 60)
			, 3) as cap_diff_per_min,
			count(*) filter (WHERE result_half_win = 1) as won,
			count(*) filter (WHERE result_half_win = 0) as lost,
			ROUND(
				(
					count(*) filter (WHERE result_half_win = 1)
					/
					count(*)::DECIMAL
				) * 100
			, 0) || '%' as winrate

		FROM playergame
		LEFT JOIN player on player.id = playergame.playerid
		LEFT JOIN game on game.id = playergame.gameid
		LEFT JOIN map on map.id = game.mapid

		WHERE
			player.id = $1
		GROUP BY map.name, unfortunateid
		HAVING count(*) >= 2
		ORDER BY rank ASC
		LIMIT 6
	`, [player], 'all')

	return raw
}

async function getTopTeammates(player) {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY
				(count(*) filter (WHERE result_half_win = 1) / count(*)::DECIMAL) * 100 DESC
			) rank,

			name as player,
			count(*) as played,
			TO_CHAR( sum(play_time) * interval '1 sec', 'hh24:mi:ss') as time,
			ROUND(
				(sum(cap_team_for)::DECIMAL - sum(cap_team_against)::DECIMAL)::DECIMAL / (sum(play_time) / 60)
			, 3) as cap_diff_per_min,
			count(*) filter (WHERE result_half_win = 1) as won,
			count(*) filter (WHERE result_half_win = 0) as lost,
			ROUND(
				(
					count(*) filter (WHERE result_half_win = 1)
					/
					count(*)::DECIMAL
				) * 100
			, 0) || '%' as winrate

		FROM playergame
		LEFT JOIN player on player.id = playergame.playerid
		LEFT JOIN game on game.id = playergame.gameid

		WHERE
			playerid != $1 AND

			gameid IN (
					SELECT
						gameid
					FROM
						playergame as pg
					INNER JOIN player ON player.id = pg.playerid
					WHERE playerid = $2 AND gameid = playergame.gameid AND pg.team = playergame.team
				)

		GROUP BY name
		ORDER BY rank ASC
		LIMIT 6
	`, [player, player], 'all')

	return raw
}

async function getTopSeasons(player) {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY
				(count(*) filter (WHERE result_half_win = 1) / count(*)::DECIMAL) * 100 DESC
			) rank,
			t.acronym,
			t.color,
			season.mode,
			season.number,
			ROUND(
				(
					count(*) filter (WHERE result_half_win = 1)
					/
					count(*)::DECIMAL
				) * 100
			, 0) || '%' as winrate

		FROM playergame
		LEFT JOIN game on game.id = playergame.gameid
		LEFT JOIN player on player.id = playergame.playerid
		LEFT JOIN seasonplayer on seasonplayer.playerid = player.id
		LEFT JOIN seasonteam on seasonteam.id = seasonplayer.seasonteamid
		LEFT JOIN season on season.id = game.seasonid AND seasonteam.seasonid = season.id
		LEFT JOIN team as t on t.id = seasonteam.teamid

		WHERE playergame.playerid = $1 AND mode IS NOT NULL
		GROUP BY game.seasonid, t.acronym, t.color, season.mode, season.number
		ORDER BY rank ASC
		LIMIT 10
	`, [player], 'all')

	return raw
}
