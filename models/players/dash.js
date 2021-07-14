const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let user = req.params.userId
		let userid = await playerExists(user)

		let data = {
			title: `${user}`,
			user: user,
			navtab: 'summary',
			nav: 'player',
			maps: await getMaps(userid),
			godteam: await getGodlyTeammates(userid),
			shitteam: await getShitTeammates(userid),
			radar: await getRadar(userid),
			rank: await getRank(userid),
		}
		res.render('player-dash', data);
	}
	catch(e) {
		res.status(400).json({error: e})
	}
}

async function playerExists(player) {
	let id = await db.select(`SELECT id from player WHERE name = $1`, [player], 'id')

	if(!id)
		throw 'cannot find player name: ' + player

	return id
}

async function getRank(player) {
	let raw = await db.select(`
		SELECT
			ROUND(CAST(playerskill.rank AS numeric), 2) as mmr
		FROM playerskill
		WHERE
			playerid = $1
		LIMIT 1
	`, [player], 'row')

	return raw
}

async function getRadar(player) {
	let raw = await db.select(`
		SELECT
			avg(cap) as cap,
			avg(prevent) as prevent,
			avg(hold) as hold,
			avg(grab) as grab,
			avg(pop) as pop,
			avg(return) as return,
			avg(drop) as drop,
			avg(elo) as elo
		FROM playergame
		LEFT JOIN game on playergame.gameid = game.id
		WHERE
			playerid = $1
			-- AND date > now() - interval '2 week'
		GROUP BY playerid
	`, [player], 'row')

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
		HAVING count(*) >= 20
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
		HAVING count(*) >= 30 AND

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
