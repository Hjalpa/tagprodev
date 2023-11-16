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
			openskill as skill
		FROM tp_player
		WHERE tp_player.tpid = $1
	`, [profileID], 'row')

	return raw
}
