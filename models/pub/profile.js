const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => {
	try {
		let data = await getProfileData(req.params.profileID)
		res.json(data)
	} catch(e) {
		res.status(400).send({error: e})
	}
}

async function getProfileData(profileID) {
	let raw = await db.select(`
		SELECT
			COUNT(*) as games,
			COUNT(*) filter (WHERE tp_playergame.winner = true) as wins,
			COUNT(*) filter (WHERE tp_playergame.winner = false) as losses,

			ROUND(COUNT(*) FILTER (WHERE tp_playergame.winner = true) * 100.0 / COUNT(*), 2)::REAL AS winrate,

			SUM(cap_team_for) as CF,
			SUM(cap_team_against) as CA,
			SUM(cap_team_for - cap_team_against) as CD,
			TO_CHAR(SUM(duration) * interval '1 sec', 'hh24:mi:ss') as timeplayed,
			ROUND(p.openskill::decimal, 2) as openskill

		FROM tp_playergame
		LEFT JOIN tp_player as p ON p.id = tp_playergame.playerid
		WHERE p.tpid = $1
		GROUP BY p.id, p.openskill
		LIMIT 1
	`, [profileID], 'row')

	return raw
}
