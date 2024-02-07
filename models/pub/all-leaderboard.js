const db = require ('../../lib/db')

module.exports.init = async (req, res) => {
	let data = {
		config: {
			title: 'Ranked Pub Leaderboard',
			name: 'rank',
			path: req.baseUrl,
			nav: {
				cat: 'rank',
				page: 'rank',
			}
		},
		players: await getData()
	}
	try {
		res.render('pub', data)
	} catch(e) {
		res.status(400).send({error: e})
	}
}

async function getData(name, auth = false) {
	let raw = await db.select(`
		SELECT
			tp_player.name as player,
			tp_player.tpid as tpid,
			CASE WHEN tp_player.tpid IS NULL THEN true ELSE false END AS white_name,
			(
				SELECT Round(openskill::DECIMAL, 2)
				FROM tp_playergame AS subpg
				WHERE subpg.playerid = tp_player.id
				ORDER BY subpg.datetime DESC
				LIMIT 1
			) AS openskill,
			COUNT(*)::real as games,
			ROUND(COUNT(*) FILTER (WHERE tp_playergame.winner = true) * 100.0 / COUNT(*), 2)::REAL AS "win%",
			COUNT(*) filter (WHERE tp_playergame.winner = true)::real as wins,
			COUNT(*) filter (WHERE tp_playergame.winner = false)::real as losses,
			CASE
				WHEN EXTRACT(DAY FROM AGE(NOW(), MAX(tp_playergame.datetime))) = 0 AND EXTRACT(HOUR FROM AGE(NOW(), MAX(tp_playergame.datetime))) = 0 THEN
				TO_CHAR(AGE(NOW(), MAX(tp_playergame.datetime)), 'iFMMI"m ago"')
				WHEN EXTRACT(DAY FROM AGE(NOW(), MAX(tp_playergame.datetime))) = 0 THEN
				TO_CHAR(AGE(NOW(), MAX(tp_playergame.datetime)), 'FMHH24"h ago"')
				ELSE
				TO_CHAR(AGE(NOW(), MAX(tp_playergame.datetime)), 'FMDD"d ago"')
			END AS "last seen"
		FROM
			tp_playergame
		LEFT JOIN tp_player ON tp_player.id = tp_playergame.playerid
		WHERE
			tp_playergame.playerid IS NOT NULL
		GROUP BY
			tp_player.id, tp_player.name, tp_player.tpid
		ORDER BY
			openskill desc
		LIMIT 200
	`, [], 'all')

	return raw
}
