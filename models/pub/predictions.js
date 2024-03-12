const db = require ('../../lib/db')

module.exports.predictions = async (req, res) => {
	try {
		res.json({
			all: await getPredictions(),
			"games without some balls": await getNoSomeBallsPredictions(),
		})
	} catch(e) {
		res.status(400).send({error: e})
	}
}

async function getPredictions(name, auth = false) {
	let raw = await db.select(`
		WITH data AS (
			SELECT
				COUNT(*) as games,
				COUNT(*) FILTER (WHERE winner = 1 AND prediction->>'red' > prediction->>'blue' OR winner = 2 AND prediction->>'blue' > prediction->>'red') AS correct
			FROM tp_game as tp_g
		)
		SELECT
			games::REAL,
			correct::REAL,
			(games - correct)::REAL AS wrong,
			CASE WHEN games > 0 THEN ROUND((correct * 100.0 / games), 2)::REAL ELSE 0 END AS correct_percentage
		FROM data;
	`, [], 'all')

	return raw
}

async function getNoSomeBallsPredictions(name, auth = false) {
	let raw = await db.select(`
		WITH data AS (
			SELECT
				COUNT(*) as games,
				COUNT(*) FILTER (WHERE winner = 1 AND prediction->>'red' > prediction->>'blue' OR winner = 2 AND prediction->>'blue' > prediction->>'red') AS correct
			FROM tp_game as tp_g
			WHERE NOT EXISTS (
				SELECT 1
				FROM tp_playergame
				WHERE tp_playergame.gameid = tp_g.id
				AND tp_playergame.playerid IN (8, 50, 18, 12, 27, 22, 23, 2)
			)
		)
		SELECT
			games::REAL,
			correct::REAL,
			games - correct::REAL AS wrong,
			CASE WHEN games > 0 THEN ROUND((correct * 100.0 / games), 2)::REAL ELSE 0 END AS correct_percentage
		FROM data;
	`, [], 'all')

	return raw
}
