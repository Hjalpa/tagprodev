const db = require ('../../lib/db')

module.exports.openskill = async (req, res) => {
	try {
		const name = req.params.name
		const auth = (req.query.auth === 'true') ? true : false
		res.json({
			openskill: await getOpenSkill(name, auth),
		})
	} catch(e) {
		res.status(400).send({error: e})
	}
}

async function getOpenSkill(name, auth = false) {
	let tpid = (auth ? 'tp_player.tpid IS NOT NULL' : 'tp_player.tpid IS NULL')
	let raw = await db.select(`
		SELECT
			openskill
		FROM tp_playergame
		LEFT JOIN tp_player ON tp_playergame.playerid = tp_player.id
		WHERE LOWER(name) = LOWER($1) AND ${tpid}
		ORDER BY tp_playergame.datetime DESC
		LIMIT 1
	`, [name], 'openskill')

	return raw ? parseFloat(raw.toFixed(2)) : '-'
}
