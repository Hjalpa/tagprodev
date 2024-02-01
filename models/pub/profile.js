const db = require ('../../lib/db')

module.exports.init = async (req, res) => {
	try {
		let profileID = req.params.profileID
		let rawTimezone = req.params.timezone
		let timezone = `${rawTimezone}${req.params[0] || ''}`

		let playerID = await getPlayerID(profileID)
		res.json({
			openskill: {
				best: await getBestSkill(playerID)
			},
			stats: {
				day: await getStats(profileID, 'day', timezone),
				week: await getStats(profileID, 'week', timezone),
				month: await getStats(profileID, 'month', timezone),
				all: await getStats(profileID, 'all'),
			},
			games: await getGames(playerID),
			skillPerDay: await getSkillPerDay(profileID, timezone),
			top: {
				maps: await getBestMaps(playerID),
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

async function getSkillPerDay(profileID, timezone) {
	let raw = await db.select(`
		WITH PlayerCTE AS (
			SELECT id AS pid
			FROM tp_player
			WHERE tp_player.tpid = $1
		)
		SELECT
			TO_CHAR(datetime::timestamp AT TIME ZONE 'UTC' AT TIME ZONE $2, 'YYYY-MM-DD') as date,
			ROUND(openskill::decimal, 2) as openskill
		FROM tp_playergame
		WHERE (playerid, DATE(datetime AT TIME ZONE 'UTC' AT TIME ZONE $2), datetime AT TIME ZONE 'UTC' AT TIME ZONE $2) IN (
			SELECT
				p.pid,
				DATE(pg.datetime AT TIME ZONE 'UTC' AT TIME ZONE $2) AS date,
				MAX(pg.datetime AT TIME ZONE 'UTC' AT TIME ZONE $2) AS min_datetime
			FROM PlayerCTE p
			JOIN tp_playergame pg ON p.pid = pg.playerid
			WHERE pg.playerid = p.pid
			GROUP BY p.pid, DATE(pg.datetime AT TIME ZONE 'UTC' AT TIME ZONE $2)
		)
		ORDER BY date DESC
	`, [profileID, timezone], 'all')

	return raw
}

async function getStats(profileID, datePeriod, timezone = false) {
	let dateFilter = (datePeriod === 'all' ? '' : ` AND tp_playergame.datetime::timestamp AT TIME ZONE 'UTC' AT TIME ZONE $2 >= NOW() - interval '1 ${datePeriod}'`);

	let condition = [profileID]
	if(timezone != false)
		condition.push(timezone)

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
			ROUND(COUNT(*) FILTER (WHERE tp_playergame.winner = true) * 100.0 / COUNT(*) FILTER (WHERE tp_playergame.winner = true OR (tp_playergame.saveattempt = false AND tp_playergame.winner = false)), 2)::REAL AS "Win%",
			COALESCE(COUNT(*)::REAL, 0) as "Games",
			COUNT(*) filter (WHERE tp_playergame.winner = true)::REAL as "Wins",
			COUNT(*) filter (WHERE tp_playergame.winner = false AND tp_playergame.saveattempt = false)::REAL as "Losses",
			COUNT(*) filter (WHERE tp_playergame.saveattempt = true AND tp_playergame.winner = true)::REAL as "Saves",
			COUNT(*) filter (WHERE tp_playergame.saveattempt = true)::REAL as "Save Attempts",
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
	`, condition, 'row')

	return raw ? raw : defaults
}

async function getGames(playerID) {
	let raw = await db.select(`
		SELECT
			pg.datetime,
			TO_CHAR(pg.duration * interval '1 sec', 'mi:ss') as duration,
			pg.finished,
			pg.saveattempt,
			pg.team,
			pg.winner,
			pg.cap_team_for,
			pg.cap_team_against,
			pg.openskill,
			Round(pg.openskill::DECIMAL - LAG(pg.openskill) OVER (ORDER BY pg.datetime)::DECIMAL, 2) AS openskill_change,
			m.name as map,
			g.uuid,
			g.tpid

		FROM tp_playergame as pg
		LEFT JOIN tp_game as g ON g.id = pg.gameid
		LEFT JOIN tp_map as m ON m.id = g.mapid
		WHERE pg.playerid = $1
		ORDER BY datetime DESC
		LIMIT 50
	`, [playerID], 'all')

	return raw
}

async function getBestMaps(playerID) {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY
					(COUNT(*) FILTER (WHERE tp_playergame.winner = true) + 0.1) / (count(*) + 1) DESC
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
		LEFT JOIN tp_game on tp_game.id = tp_playergame.gameid
		LEFT JOIN tp_map on tp_map.id = tp_game.mapid
		WHERE
			tp_playergame.playerid = $1 AND (tp_playergame.saveattempt = false OR tp_playergame.winner = true)
		GROUP BY tp_map.name
		ORDER BY rank ASC
		LIMIT 15
	`, [playerID], 'all')

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
			playerid != $1 AND tp_player.tpid IS NOT NULL AND (tp_playergame.saveattempt = false OR tp_playergame.winner = true)
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
			playerid != $1 AND tp_player.tpid IS NOT NULL AND (tp_playergame.saveattempt = false OR tp_playergame.winner = true)
		GROUP BY tp_player.name, tp_player.tpid, tp_playergame.playerid
		ORDER BY rank ASC
		LIMIT 15
	`, [playerID], 'all')

	return raw
}
