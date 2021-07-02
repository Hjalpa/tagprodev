const db = require ('../lib/db')
const util = require ('../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {

	let data = {
		title: 'nom',
		nav: 'player'
	}
	res.render('player', data);
}

async function getPlayers() {
	let raw = await db.select(`
		SELECT
			player.name as name
		FROM player
		LIMIT 1
	`, [], 'all')

	return raw
}
