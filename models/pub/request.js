const db = require ('../../lib/db')

module.exports.openskill = async (req, res) => {
	try {
		const tpid = req.query.tpid || null
		const name = req.query.name || null
		res.json({
			openskill: await getOpenSkill(tpid, name),
		})
	} catch(e) {
		res.status(400).send({error: e})
	}
}

async function getOpenSkill(tpid, name) {
	let raw = await db.select(`
		SELECT
			openskill
		FROM tp_playergame
		LEFT JOIN tp_player ON tp_playergame.playerid = tp_player.id
		WHERE
			(
				tpid = $1 AND tpid IS NOT NULL
			)
			OR
			(
				tpid IS NULL AND $1 IS NULL and LOWER(name) = LOWER($2)
			)
		ORDER BY tp_playergame.datetime DESC
		LIMIT 1
	`, [tpid, name], 'openskill')

	return parseFloat(raw.toFixed(2)) || '-'
}
