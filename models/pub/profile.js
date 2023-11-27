const db = require ('../../lib/db')

module.exports.init = async (req, res) => {
	try {
		let profileID = req.params.profileID
		let playerID = await getPlayerID(profileID)
		res.json({
			openskill: {
				best: await getBestSkill(playerID)
			},
			stats: {
				day: await getStats(profileID, 'day'),
				week: await getStats(profileID, 'week'),
				month: await getStats(profileID, 'month'),
				all: await getStats(profileID, 'all'),
			},
			games: await getGames(playerID),
			skillPerDay: await getSkillPerDay(profileID),
			top: {
				maps: await getBestMaps(profileID),
				with: await getBestWith(playerID),
				against: await getBestAgainst(playerID),
			}
		})
	} catch(e) {
		res.status(400).send({error: e})
	}
}

async function getPlayerID(profileID) {
	let raw = await db.select(`
		SELECT
			id
		FROM tp_player
		WHERE tpid = $1
		LIMIT 1
	`, [profileID], 'id')

	return raw
}

async function getBestSkill(playerID) {
	let raw = await db.select(`
		SELECT
			openskill
		FROM tp_playergame
		WHERE playerid = $1
		ORDER BY openskill DESC
		LIMIT 1
	`, [playerID], 'openskill')

	return raw
}

async function getSkillPerDay(profileID) {
	let raw = await db.select(`
		WITH PlayerCTE AS (
			SELECT id AS pid
			FROM tp_player
			WHERE tp_player.tpid = $1
		)
		SELECT
			TO_CHAR(DATE(datetime), 'YYYY-MM-DD') as date,
			ROUND(openskill::decimal, 2) as openskill
		FROM tp_playergame
		WHERE (playerid, DATE(datetime), datetime) IN (
			SELECT
				p.pid,
				DATE(pg.datetime) AS date,
				MAX(pg.datetime) AS min_datetime
			FROM PlayerCTE p
			JOIN tp_playergame pg ON p.pid = pg.playerid
			WHERE pg.playerid = p.pid
			GROUP BY p.pid, DATE(pg.datetime)
		)
		order by date desc
	`, [profileID], 'all')

	return raw
}

async function getStats(profileID, datePeriod) {
	let dateFilter = (datePeriod === 'all' ? '' : ` AND tp_playergame.datetime >= NOW() - interval '1 ${datePeriod}'`);

	let defaults = {
		"Win%": 0,
		"Games": 0,
		"Wins": 0,
		"Losses": 0,
		"Quits": 0,
		"Caps For": 0,
		"Caps Against": 0,
		"Cap Difference": 0,
		"Time Played": "00:00:00",
	}

	let raw = await db.select(`
		SELECT
			ROUND(COUNT(*) FILTER (WHERE tp_playergame.winner = true) * 100.0 / COUNT(*), 2)::REAL AS "Win%",
			COALESCE(COUNT(*)::REAL, 0) as "Games",
			COUNT(*) filter (WHERE tp_playergame.winner = true)::REAL as "Wins",
			COUNT(*) filter (WHERE tp_playergame.winner = false)::REAL as "Losses",
			COUNT(*) filter (WHERE tp_playergame.finished = false)::REAL as "Quits",
			SUM(cap_team_for)::REAL as "Caps For",
			SUM(cap_team_against)::REAL as "Caps Against",
			SUM(cap_team_for - cap_team_against)::REAL as "Cap Difference",
			TO_CHAR(SUM(duration) * interval '1 sec', 'hh24:mi:ss') as "Time Played"

		FROM tp_playergame
		LEFT JOIN tp_player as p ON p.id = tp_playergame.playerid
		WHERE p.tpid = $1 ${dateFilter}
		GROUP BY p.id
		LIMIT 1
	`, [profileID], 'row')

	return raw ? raw : defaults
}

async function getGames(playerID) {
	let raw = await db.select(`
		SELECT
			pg.datetime,
			TO_CHAR(pg.duration * interval '1 sec', 'mi:ss') as duration,
			pg.finished,
			pg.team,
			pg.winner,
			pg.cap_team_for,
			pg.cap_team_against,
			pg.openskill,
			Round(pg.openskill::DECIMAL - LAG(pg.openskill) OVER (ORDER BY pg.datetime)::DECIMAL, 2) AS openskill_change,
			m.name as map,
			g.uuid

		FROM tp_playergame as pg
		LEFT JOIN tp_game as g ON g.id = pg.gameid
		LEFT JOIN tp_map as m ON m.id = g.mapid
		WHERE pg.playerid = $1
		ORDER BY datetime DESC
		LIMIT 50
	`, [playerID], 'all')

	return raw
}

async function getBestMaps(profileID) {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY
					ROUND(
						(
							COUNT(*) FILTER (WHERE tp_playergame.winner = true)
							/
							COUNT(*)::DECIMAL
						) * 100
					, 2) DESC, count(*) DESC
			) rank,
			tp_map.name as map,
			ROUND(
				(
					COUNT(*) FILTER (WHERE tp_playergame.winner = true)
					/
					COUNT(*)::DECIMAL
				) * 100
			, 0) || '%' as winrate,
			COUNT(*) as games

		FROM tp_playergame
		LEFT JOIN tp_player on tp_player.id = tp_playergame.playerid
		LEFT JOIN tp_game on tp_game.id = tp_playergame.gameid
		LEFT JOIN tp_map on tp_map.id = tp_game.mapid

		WHERE
			tp_player.tpid = $1
		GROUP BY tp_map.name
		HAVING COUNT(*) > (
			SELECT
				AVG(avg_games) as overall_avg_games
			FROM (
				SELECT
					AVG(count(*)) OVER (PARTITION BY tp_map.id) as avg_games
				FROM
					tp_playergame
				LEFT JOIN tp_player ON tp_player.id = tp_playergame.playerid
				LEFT JOIN tp_game ON tp_game.id = tp_playergame.gameid
				LEFT JOIN tp_map ON tp_map.id = tp_game.mapid
				WHERE
					tp_player.tpid = $1
				GROUP BY tp_map.id
			) AS map_avg_games
		)
		ORDER BY rank ASC
		LIMIT 15
	`, [profileID], 'all')

	return raw
}

async function getBestWith(playerID) {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY
					(COUNT(*) FILTER (WHERE tp_playergame.winner = true) + 0.1) / (count(*) + 1) DESC
			) rank,
			tp_player.name,
			tp_player.tpid,
			ROUND((COUNT(*) FILTER (WHERE tp_playergame.winner = true) / COUNT(*)::DECIMAL) * 100, 0) || '%' AS winrate,
			COUNT(*) AS games,
			(SELECT flair from tp_playergame as tppg where tppg.playerid = tp_playergame.playerid ORDER by id DESC LIMIT 1) as flair

		FROM tp_playergame
		LEFT JOIN tp_player ON tp_player.id = tp_playergame.playerid
		JOIN (
			SELECT DISTINCT gameid, team
			FROM tp_playergame pg
			WHERE pg.playerid = $1
		) AS subquery ON tp_playergame.gameid = subquery.gameid AND tp_playergame.team = subquery.team
		WHERE
			playerid != $1 AND tp_player.tpid IS NOT NULL
		GROUP BY tp_player.name, tp_player.tpid, tp_playergame.playerid
		ORDER BY rank ASC
		LIMIT 15
	`, [playerID], 'all')

	return raw
}

async function getBestAgainst(playerID) {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY
					(COUNT(*) FILTER (WHERE tp_playergame.winner = false) + 0.1) / (count(*) + 1) DESC
			) rank,
			tp_player.name,
			tp_player.tpid,
			ROUND((COUNT(*) FILTER (WHERE tp_playergame.winner = false) / COUNT(*)::DECIMAL) * 100, 0) || '%' AS winrate,
			COUNT(*) AS games,
			(SELECT flair from tp_playergame as tppg where tppg.playerid = tp_playergame.playerid ORDER by id DESC LIMIT 1) as flair

		FROM tp_playergame
		LEFT JOIN tp_player ON tp_player.id = tp_playergame.playerid
		JOIN (
			SELECT DISTINCT gameid, team
			FROM tp_playergame pg
			WHERE pg.playerid = $1
		) AS subquery ON tp_playergame.gameid = subquery.gameid AND tp_playergame.team != subquery.team
		WHERE
			playerid != $1 AND tp_player.tpid IS NOT NULL
		GROUP BY tp_player.name, tp_player.tpid, tp_playergame.playerid
		ORDER BY rank ASC
		LIMIT 15
	`, [playerID], 'all')

	return raw
}
