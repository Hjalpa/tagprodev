const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {

	try {
		let data = {
			config: {
				title: req.player.name,
				player: req.player.name,
				path: req.baseUrl,
				nav: {
					cat: 'player',
					page: 'league',
				}
			},
			// star ratings
			maps: await getMaps(req.player.id),
			goodteam: await getGodlyTeammates(req.player.id),
			badteam: await getShitTeammates(req.player.id),
			monthly: await getMonthData(req.player.id),
		}

		// res.json(data)
		res.render('player-dash', data)
	}
	catch(e) {
		res.status(400).json({error: e})
	}
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

async function getShitTeammates(player) {
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
			, 2) < 50



		ORDER BY winrate ASC
		LIMIT 6
	`, [player, player], 'all')

	return raw
}

async function getMonthData(player) {

	let raw = await db.select(`
		SELECT
			CONCAT(
				TO_CHAR(DATE_TRUNC('month', date), 'Mon')
				,' ',
				extract(year from date)
			) AS monthyear,
			date_trunc('month', date) as dates,

			count(*) games,
			ROUND((sum(game.elo)::FLOAT / count(*))::numeric , 2) as elo,

			ROUND(sum(tag) / (sum(play_time)::numeric / 60), 2) as tags,
			ROUND(sum(pop) / (sum(play_time)::numeric / 60), 2) as pops,
			ROUND(sum(grab) / (sum(play_time)::numeric / 60), 2) as grabs,
			-- ROUND(sum(drop) / (sum(play_time)::numeric / 60), 2) as drops,
			ROUND(sum(flaccid) / (sum(play_time) / 60)::numeric, 2) as flaccids,
			ROUND(sum(hold) / (sum(play_time)::numeric / 60), 2) as hold,
			ROUND(sum(cap) / (sum(play_time)::numeric / 60), 2) as caps,
			ROUND(sum(prevent) / (sum(play_time)::numeric / 60), 2) as prevent,
			ROUND(sum(playergame.return) / (sum(play_time)::numeric / 60), 2) as returns,
			ROUND((sum(pup_tp)+sum(pup_rb)+sum(pup_jj)) / (sum(play_time) / 60)::numeric, 2) as pups,

			-- ROUND(sum(hold) / sum(grab)::numeric, 2) as holdpergrab,
			ROUND(
				(
					(ROUND((sum(pup_tp)+sum(pup_rb)+sum(pup_jj)) / (sum(play_time) / 60)::numeric, 2))
					/
					(ROUND((sum(pup_tp_team_for)+sum(pup_rb_team_for)+sum(pup_jj_team_for)) / (sum(play_time) / 60)::numeric, 2))
				) * 100
			, 2) || '%' as pup_share

		FROM playergame
		-- LEFT JOIN player on playergame.playerid = player.id
		LEFT JOIN game on game.id = playergame.gameid
		WHERE playerid = $1
		GROUP BY monthyear, dates
		ORDER BY dates DESC
	`, [player], 'all')

	return raw
}
