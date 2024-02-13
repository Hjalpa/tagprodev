const db = require ('../../lib/db')

module.exports.init = async (req, res) => {
	try {
		res.json({
			gamesPerDay: await getGamesPerDay(req),
		})
	} catch(e) {
		res.status(400).send({error: e})
	}
}

async function getGamesPerDay(req) {
	let rawTimezone = req.params.timezone
	let timezone = `${rawTimezone}${req.params[0] || ''}`

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
