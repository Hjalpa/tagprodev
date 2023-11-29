const db = require ('../../lib/db')

module.exports.init = async (req, res) => {
	try {
		res.json({
			gamesPerDay: await getGamesPerDay(req),
			top: {
				maps: await getTopMaps(),
				servers: await getTopServers(),
			}
		})
	} catch(e) {
		res.status(400).send({error: e})
	}
}

async function getGamesPerDay(req) {
	let timezone = req.body.timezone
	let raw = await db.select(`
		SELECT
			TO_CHAR(datetime::timestamp AT TIME ZONE 'UTC' AT TIME ZONE $1, 'YYYY-MM-DD') as date,
			COUNT(*) AS games
		FROM tp_game
		GROUP BY date
		ORDER BY date DESC
	`, [timezone], 'all')

	return raw
}

async function getTopMaps() {
	let raw = await db.select(`
		SELECT
			tp_map.name,
			COUNT(*) AS games,
			TO_CHAR(AVG(duration) * INTERVAL '1 millisecond', 'MI:SS') as avg_duration,
			ROUND(SUM(1) FILTER(WHERE tp_game.winner = 1) * 100.0 / COUNT(*), 2) AS red_win_percentage,
			ROUND(SUM(1) FILTER(WHERE tp_game.winner = 2) * 100.0 / COUNT(*), 2) AS blue_win_percentage,
			max(tp_game.datetime) as date

		FROM tp_game
		LEFT JOIN tp_map ON tp_map.id = tp_game.mapid
		GROUP BY tp_map.name
		ORDER BY games DESC
		LIMIT 20
	`, [], 'all')

	return raw
}

async function getTopServers() {
	let raw = await db.select(`
		SELECT
			tp_server.name,
			COUNT(*) AS games,
			TO_CHAR(AVG(duration) * INTERVAL '1 millisecond', 'MI:SS') as avg_duration,
			ROUND(SUM(1) FILTER(WHERE tp_game.winner = 1) * 100.0 / COUNT(*), 2) AS red_win_percentage,
			ROUND(SUM(1) FILTER(WHERE tp_game.winner = 2) * 100.0 / COUNT(*), 2) AS blue_win_percentage,
			max(tp_game.datetime) as date

		FROM tp_game
		LEFT JOIN tp_server ON tp_server.id = tp_game.serverid
		GROUP BY tp_server.name
		ORDER BY games DESC
		LIMIT 20
	`, [], 'all')

	return raw
}
