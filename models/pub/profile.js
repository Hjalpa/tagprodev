const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => {
	try {
		let profileID = req.params.profileID
		res.json({
			openskill: await getOpenSkill(profileID),
			stats: {
				day: await getStats(profileID, 'day'),
				week: await getStats(profileID, 'week'),
				month: await getStats(profileID, 'month'),
				all: await getStats(profileID, 'all'),
			},
			games: await getGames(profileID),
			skillPerDay: await getSkillPerDay(profileID),
			top: {
				maps: await getTopMaps(profileID),
			}
		})
	} catch(e) {
		res.status(400).send({error: e})
	}
}

async function getOpenSkill(profileID) {
	let raw = await db.select(`
		SELECT
			ROUND(openskill::decimal, 2)::real as openskill

		FROM tp_player
		WHERE tpid = $1
		LIMIT 1
	`, [profileID], 'openskill')

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
		"Caps For": 0,
		"Caps Against": 0,
		"Cap Difference": 0,
		"Time Played": "00:00:00"
	}

	let raw = await db.select(`
		SELECT
			ROUND(COUNT(*) FILTER (WHERE tp_playergame.winner = true) * 100.0 / COUNT(*), 2)::REAL AS "Win%",
			COALESCE(COUNT(*)::REAL, 0) as "Games",
			COUNT(*) filter (WHERE tp_playergame.winner = true)::REAL as "Wins",
			COUNT(*) filter (WHERE tp_playergame.winner = false)::REAL as "Losses",
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

async function getGames(profileID) {
	let raw = await db.select(`
		SELECT
			pg.datetime,
			pg.duration,
			pg.finished,
			pg.team,
			pg.winner,
			pg.cap_team_for,
			pg.cap_team_against,
			pg.openskill
		FROM tp_playergame as pg
		LEFT JOIN tp_player as p ON p.id = pg.playerid
		WHERE p.tpid = $1
		ORDER BY datetime DESC
		LIMIT 1000
	`, [profileID], 'all')

	return raw
}

async function getTopMaps(profileID) {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY
					ROUND(
						(
							count(*) filter (WHERE tp_playergame.winner = true)
							/
							count(*)::DECIMAL
						) * 100
					, 2) DESC
			)::real rank,
			tp_map.name as map,
			ROUND(
				(
					count(*) filter (WHERE tp_playergame.winner = true)
					/
					count(*)::DECIMAL
				) * 100
			, 0) || '%' as winrate

		FROM tp_playergame
		LEFT JOIN tp_player on tp_player.id = tp_playergame.playerid
		LEFT JOIN tp_game on tp_game.id = tp_playergame.gameid
		LEFT JOIN tp_map on tp_map.id = tp_game.mapid

		WHERE
			tp_player.tpid = $1
		GROUP BY tp_map.name
		HAVING count(*) > 3
		ORDER BY rank ASC
		LIMIT 10
	`, [profileID], 'all')

	return raw
}
