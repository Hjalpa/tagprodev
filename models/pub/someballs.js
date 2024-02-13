const db = require ('../../lib/db')

module.exports.someballs = async (req, res) => {
	try {
		res.json(await getSomeballs())
	} catch(e) {
		res.status(400).send({error: e})
	}
}

async function getSomeballs(name, auth = false) {
	let raw = await db.select(`
		SELECT
			name,
			(SELECT COUNT(*) FROM tp_playergame WHERE playerid = tp_player.id)::REAL as games,
			(SELECT COUNT(*) FROM tp_playergame WHERE playerid = tp_player.id AND winner = true)::REAL as win,
			(SELECT COUNT(*) FROM tp_playergame WHERE playerid = tp_player.id AND winner = false)::REAL as lost,
			CAST(
				CASE
					WHEN (SELECT COUNT(*) FROM tp_playergame WHERE playerid = tp_player.id) > 0 THEN
						(SELECT COUNT(*) FROM tp_playergame WHERE playerid = tp_player.id AND winner = true) / CAST((SELECT COUNT(*) FROM tp_playergame WHERE playerid = tp_player.id) AS FLOAT) * 100
					ELSE
						0
				END AS NUMERIC(10, 2)
			)::REAL as win_ratio
		FROM tp_player
		LEFT JOIN tp_playergame ON tp_player.id = tp_playergame.playerid
								AND tp_playergame.datetime = (
									SELECT MAX(datetime)
									FROM tp_playergame
									WHERE tp_playergame.playerid = tp_player.id
								)
		WHERE tp_player.name IN ('Some Ball 1', 'Some Ball 2', 'Some Ball 3', 'Some Ball 4', 'Some Ball 5', 'Some Ball 6', 'Some Ball 7', 'Some Ball 8')
			AND tp_player.tpid IS NULL
		ORDER BY games DESC
	`, [], 'all')

	return raw
}
