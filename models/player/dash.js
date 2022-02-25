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

			bestseasons: await getBestSeasons(req.player.id),

			// maps: await getMaps(req.player.id),
			// goodteam: await getGodlyTeammates(req.player.id),
		}

		res.render('player-dash', data)
	}
	catch(e) {
		res.status(400).json({error: e})
	}
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
		,2 ) || '%' as winrate
		FROM playergame
		WHERE playerid = $1
		GROUP BY playerid
	`, [playerid], 'winrate')
	return raw
}

async function getMaps(player) {
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
			, 2) as winrate

		FROM playergame
		LEFT JOIN player on player.id = playergame.playerid
		LEFT JOIN game on game.id = playergame.gameid
		LEFT JOIN map on map.id = game.mapid

		WHERE
			player.id = $1
		GROUP BY map.name
		HAVING count(*) >= 2
		ORDER BY winrate DESC
		LIMIT 6
	`, [player], 'all')

	return raw
}

async function getGodlyTeammates(player) {
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
			, 2) as winrate

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
		HAVING count(*) >= 15 AND

			ROUND(
				(
					count(*) filter (WHERE result_half_win = 1)
					/
					count(*)::DECIMAL
				) * 100
			, 2) > 50

		ORDER BY winrate DESC
		LIMIT 6
	`, [player, player], 'all')

	return raw
}

async function getBestSeasons(player) {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY
				(count(*) filter (WHERE result_half_win = 1) / count(*)::DECIMAL) * 100 DESC
			) rank,

			t.acronym,
			t.color,


			ROUND(
				(
					count(*) filter (WHERE result_half_win = 1)
					/
					count(*)::DECIMAL
				) * 100
			, 2) as winrate

		FROM playergame
		LEFT JOIN player on player.id = playergame.playerid
		LEFT JOIN game on game.id = playergame.gameid
		LEFT JOIN playerseason on game.id = playergame.gameid
		LEFT JOIN team as t on t.id = playerseason.teamid

		WHERE
			playerid != $1 AND

			gameid IN (
					SELECT
						gameid
					FROM
						playergame as pg
					INNER JOIN player ON player.id = pg.playerid
					WHERE playerid = $1 AND gameid = playergame.gameid AND pg.team = playergame.team
				)

		GROUP BY t.acronym, seasonid
		HAVING count(*) >= 5
		ORDER BY winrate ASC
		LIMIT 6
	`, [player], 'all')

	console.log(raw)
	return raw
}
