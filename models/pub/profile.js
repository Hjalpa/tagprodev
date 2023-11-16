const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => {
	try {
		let profileID = req.params.profileID
		res.json({
			games: await getGames(profileID),
			stats: {
				day: await getStats(profileID, 'day'),
				week: await getStats(profileID, 'week'),
				month: await getStats(profileID, 'month'),
				all: await getStats(profileID, 'all'),
			}
		})
	} catch(e) {
		res.status(400).send({error: e})
	}
}

async function getStats(profileID, datePeriod) {
	let dateFilter = (datePeriod === 'all' ? '' : ` AND tp_playergame.datetime >= NOW() - interval '1 ${datePeriod}'`);

	let raw = await db.select(`
		SELECT
			ROUND(COUNT(*) FILTER (WHERE tp_playergame.winner = true) * 100.0 / COUNT(*), 2)::REAL AS "Win% ",
			COUNT(*)::REAL as Games,
			COUNT(*) filter (WHERE tp_playergame.winner = true)::REAL as Wins,
			COUNT(*) filter (WHERE tp_playergame.winner = false)::REAL as Losses,
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

	return raw
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
		ORDER BY datetime ASC
		LIMIT 1000;
	`, [profileID], 'all')

	return raw
}
